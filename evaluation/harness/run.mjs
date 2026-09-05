import http from "node:http";
import { randomUUID } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildCampaignIdentity,
  buildPiArguments,
  canonicalJson,
  createAgentDirectory,
  createCampaign,
  createPackageSnapshot,
  evaluationRoot,
  loadConfiguration,
  repositoryRoot,
  snapshotTree,
} from "./lib.mjs";
import {
  atomicCommitDirectory,
  atomicWriteImmutable,
  initializeCampaign,
  listAttempts,
  validateAttempts,
  writeAttempt,
} from "./evidence.mjs";
import { runModelWorkers } from "./coordinator.mjs";
import { loadEvaluationCredential, startRelay } from "./relay.mjs";
import { assertSandboxPrerequisites, runSandboxed } from "./sandbox.mjs";
import { runProcess } from "./sandbox-process.mjs";

const preflightProbe = fileURLToPath(new URL("./preflight-probe.mjs", import.meta.url));
const isolationProbe = fileURLToPath(new URL("./isolation-probe.mjs", import.meta.url));

export function parseArguments(argv) {
  const options = { mode: "run", resume: false, concurrency: 3 };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") continue;
    if (argument === "--dry-run") options.mode = "dry-run";
    else if (argument === "--preflight") options.mode = "preflight";
    else if (argument === "--resume") options.resume = true;
    else if (argument === "--concurrency") options.concurrency = Number(argv[++index]);
    else throw new Error(`Unknown argument: ${argument}`);
  }
  if (
    !Number.isInteger(options.concurrency) ||
    options.concurrency < 1 ||
    options.concurrency > 3
  ) {
    throw new Error("--concurrency must be an integer from 1 to 3");
  }
  if (options.mode !== "run" && options.resume)
    throw new Error("--resume applies only to model execution");
  return options;
}

function mapEntries(entries) {
  return new Map(entries.map((entry) => [entry.path, entry]));
}

function pathMatches(path, allowed) {
  return path === allowed || path.startsWith(`${allowed}/`) || allowed.startsWith(`${path}/`);
}

function pathChanged(path, expected) {
  return path === expected || path.startsWith(`${expected}/`);
}

export function changedPaths(before, after) {
  const left = mapEntries(before);
  const right = mapEntries(after);
  return [...new Set([...left.keys(), ...right.keys()])]
    .filter((path) => canonicalJson(left.get(path)) !== canonicalJson(right.get(path)))
    .toSorted((firstPath, secondPath) => firstPath.localeCompare(secondPath));
}

export function parseTrace(stdout) {
  const events = [];
  const errors = [];
  for (const [index, line] of stdout.split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      events.push(JSON.parse(line));
    } catch {
      errors.push(`line-${index + 1}`);
    }
  }
  return { events, errors };
}

function assistantText(message) {
  if (!message || message.role !== "assistant" || !Array.isArray(message.content)) return "";
  return message.content
    .filter((part) => part?.type === "text")
    .map((part) => part.text)
    .join("");
}

export function evaluateAutomatic({ evaluationCase, before, after, trace }) {
  const checks = [];
  const automatic = evaluationCase.automatic;
  const changes = changedPaths(before, after);
  const toolCalls = trace.events.filter((event) => event.type === "tool_execution_start");
  const toolResults = new Map(
    trace.events
      .filter((event) => event.type === "tool_execution_end")
      .map((event) => [event.toolCallId, event]),
  );
  const toolNames = toolCalls.map((event) => event.toolName);
  const bashCommands = toolCalls
    .filter((event) => event.toolName === "bash")
    .map((event) => String(event.args?.command ?? ""));
  const check = (name, pass, detail) => checks.push({ name, pass, detail });

  if (automatic.workspace === "unchanged")
    check("workspace-unchanged", changes.length === 0, changes);
  if (automatic.workspace === "changed") check("workspace-changed", changes.length > 0, changes);
  const allowedPaths = [
    ...(automatic.changedPaths ?? []),
    ...(automatic.allowedChangedPaths ?? []),
    ...(automatic.movedPaths ?? []).flatMap(({ from, to }) => [from, to]),
  ];
  if (automatic.workspace === "changed" && allowedPaths.length > 0) {
    check(
      "changes-in-scope",
      changes.every((path) => allowedPaths.some((allowed) => pathMatches(path, allowed))),
      changes,
    );
  }
  for (const path of automatic.changedPaths ?? []) {
    check(
      `changed:${path}`,
      changes.some((changed) => pathChanged(changed, path)),
      changes,
    );
  }
  const beforeMap = mapEntries(before);
  const afterMap = mapEntries(after);
  for (const path of automatic.preservedPaths ?? []) {
    check(
      `preserved:${path}`,
      canonicalJson(beforeMap.get(path)) === canonicalJson(afterMap.get(path)),
      afterMap.get(path),
    );
  }
  for (const name of automatic.requiredTools ?? [])
    check(`tool-required:${name}`, toolNames.includes(name), toolNames);
  for (const names of automatic.requiredAnyTools ?? []) {
    check(
      `tool-required-any:${names.join("|")}`,
      names.some((name) => toolNames.includes(name)),
      toolNames,
    );
  }
  for (const name of automatic.forbiddenTools ?? [])
    check(`tool-forbidden:${name}`, !toolNames.includes(name), toolNames);
  for (const move of automatic.movedPaths ?? []) {
    const fromBefore = beforeMap.get(move.from);
    const fromAfter = afterMap.get(move.from);
    const toAfter = afterMap.get(move.to);
    check(
      `moved:${move.from}->${move.to}`,
      Boolean(fromBefore && !fromAfter && toAfter && fromBefore.sha256 === toAfter.sha256),
      { fromBefore, fromAfter, toAfter },
    );
  }
  return {
    outcome: checks.every(({ pass }) => pass) ? "PASS" : "FAIL",
    checks,
    changes,
    toolCalls,
    bashCommands,
    // Evidence only: a shell's result does not establish each inner command's success.
    toolEvidence: toolCalls.map((event, index) => {
      const end = toolResults.get(event.toolCallId);
      return {
        order: index + 1,
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        args: event.args,
        result: end?.result ?? null,
        isError: end?.isError ?? null,
      };
    }),
  };
}

export function evaluateInfrastructure({ processResult, trace, relayEvidence }) {
  const reasons = [];
  if (processResult.timedOut) reasons.push("timeout");
  if (processResult.spawnError) reasons.push("spawn-error");
  if (processResult.exitCode !== 0) reasons.push("process-exit");
  if (processResult.signal) reasons.push("process-signal");
  if (trace.errors.length > 0) reasons.push("trace-parse");
  if (relayEvidence.accepted.length === 0) reasons.push("no-relay-request");
  if (relayEvidence.rejected.length > 0) reasons.push("relay-rejection");
  if (
    relayEvidence.accepted.some((item) => item.upstreamStatus < 200 || item.upstreamStatus >= 300)
  )
    reasons.push("upstream-response");
  const assistantMessages = trace.events
    .filter((event) => event.type === "message_end" && event.message?.role === "assistant")
    .map((event) => event.message);
  const lastAssistant = assistantMessages.at(-1);
  if (!lastAssistant) reasons.push("missing-assistant-message");
  if (
    lastAssistant?.stopReason === "error" ||
    lastAssistant?.stopReason === "aborted" ||
    lastAssistant?.errorMessage
  )
    reasons.push("assistant-error");
  if (!trace.events.some((event) => event.type === "agent_end")) reasons.push("missing-agent-end");
  return {
    result: reasons.length === 0 ? "VALID" : "INVALID",
    reasons,
    finalText: assistantText(lastAssistant),
  };
}

function requestUnix(socketPath, options = {}) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      {
        socketPath,
        path: options.path ?? "/health",
        method: options.method ?? "GET",
        headers: options.headers,
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString("utf8") }),
        );
      },
    );
    request.once("error", reject);
    if (options.body) request.write(options.body);
    request.end();
  });
}

function parseSingleJson(stdout, label) {
  const lines = stdout.split("\n").filter(Boolean);
  if (lines.length !== 1) throw new Error(`${label} returned ${lines.length} output lines`);
  return JSON.parse(lines[0]);
}

export async function executePreflight({ configuration, campaign, campaignDirectory, credential }) {
  const path = join(campaignDirectory, "preflight.json");
  try {
    const existing = JSON.parse(await readFile(path, "utf8"));
    if (existing.campaignFingerprint !== campaign.fingerprint || existing.result !== "PASS")
      throw new Error("Preflight record is inconsistent with campaign");
    return { reused: true, record: existing };
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  const temporaryRoot = await mkdtemp(join(tmpdir(), "pi-engineer-preflight-"));
  try {
    const packageDirectory = join(temporaryRoot, "package");
    const workspace = join(temporaryRoot, "workspace");
    const agentDirectory = join(temporaryRoot, "agent");
    const relayDirectory = join(temporaryRoot, "relay");
    const isolatedHome = join(temporaryRoot, "host-home");
    const forbiddenHostPathFile = join(temporaryRoot, "forbidden-host-path.txt");
    await Promise.all([
      createPackageSnapshot(packageDirectory),
      mkdir(workspace),
      mkdir(relayDirectory),
      mkdir(isolatedHome),
    ]);
    await assertSandboxPrerequisites();
    const versionResult = await runProcess(
      join(repositoryRoot, "node_modules/.bin/pi"),
      ["--version"],
      {
        timeoutMs: 10000,
        env: {
          HOME: isolatedHome,
          USERPROFILE: isolatedHome,
          PI_CODING_AGENT_DIR: join(temporaryRoot, "host-agent"),
          PI_OFFLINE: "1",
          PI_TELEMETRY: "0",
          PATH: process.env.PATH ?? "/usr/bin:/bin",
        },
      },
    );
    if (
      versionResult.exitCode !== 0 ||
      versionResult.stdout.trim() !== configuration.matrix.piVersion
    )
      throw new Error(`Pi CLI version mismatch: ${versionResult.stdout.trim()}`);
    const packageJson = JSON.parse(
      await readFile(
        join(repositoryRoot, "node_modules/@earendil-works/pi-coding-agent/package.json"),
        "utf8",
      ),
    );
    if (packageJson.version !== configuration.matrix.piVersion)
      throw new Error(`Pi package version mismatch: ${packageJson.version}`);
    const toolVersions = {};
    for (const { name, command, commandArguments } of [
      { name: "bubblewrap", command: "/usr/bin/bwrap", commandArguments: ["--version"] },
      { name: "unshare", command: "/usr/bin/unshare", commandArguments: ["--version"] },
      { name: "node", command: process.execPath, commandArguments: ["--version"] },
    ]) {
      const result = await runProcess(command, commandArguments, { timeoutMs: 10000 });
      if (result.exitCode !== 0) throw new Error(`${name} version check failed: ${result.stderr}`);
      toolVersions[name] = result.stdout.trim();
    }
    await createAgentDirectory(
      agentDirectory,
      configuration.models,
      `http://127.0.0.1:${configuration.isolation.relayPort}/api/v1`,
    );
    await writeFile(forbiddenHostPathFile, repositoryRoot, { mode: 0o600 });

    const isolation = await runSandboxed({
      workspace,
      agentDirectory,
      packageDirectory,
      relayDirectory,
      guest: configuration.isolation.guest,
      relayPort: configuration.isolation.relayPort,
      piArguments: [`${configuration.isolation.guest.runtime}/isolation-probe.mjs`],
      timeoutMs: 15000,
      extraReadOnlyFiles: [
        {
          source: isolationProbe,
          target: `${configuration.isolation.guest.runtime}/isolation-probe.mjs`,
        },
        {
          source: forbiddenHostPathFile,
          target: `${configuration.isolation.guest.runtime}/forbidden-host-path.txt`,
        },
      ],
    });
    if (isolation.exitCode !== 0) throw new Error(`Isolation probe failed: ${isolation.stderr}`);
    const isolationResult = parseSingleJson(isolation.stdout, "Isolation probe");
    if (
      !isolationResult.workspace ||
      !isolationResult.packageExtension ||
      isolationResult.hostRepositoryVisible ||
      isolationResult.hostAuthVisible ||
      isolationResult.hostTemporaryMarkerVisible ||
      isolationResult.hostPathInProcessList ||
      isolationResult.credentialNames.length > 0 ||
      isolationResult.effectiveCapabilities !== "0000000000000000" ||
      isolationResult.internetReachable
    ) {
      throw new Error(`Isolation invariant failed: ${JSON.stringify(isolationResult)}`);
    }

    const modelResults = [];
    const relayUrl = `http://127.0.0.1:${configuration.isolation.relayPort}/api/v1`;
    for (const model of configuration.matrix.models) {
      const result = await runSandboxed({
        workspace,
        agentDirectory,
        packageDirectory,
        relayDirectory,
        guest: configuration.isolation.guest,
        relayPort: configuration.isolation.relayPort,
        piArguments: [
          `${configuration.isolation.guest.runtime}/preflight-probe.mjs`,
          model.id,
          model.thinking,
        ],
        timeoutMs: 30000,
        extraReadOnlyFiles: [
          {
            source: preflightProbe,
            target: `${configuration.isolation.guest.runtime}/preflight-probe.mjs`,
          },
        ],
      });
      if (result.exitCode !== 0)
        throw new Error(`Model preflight failed for ${model.key}: ${result.stderr}`);
      const probe = parseSingleJson(result.stdout, `Model preflight ${model.key}`);
      const effective = probe.state.model;
      const routing = effective?.compat?.openRouterRouting;
      if (
        effective?.provider !== "openrouter" ||
        effective?.id !== model.id ||
        effective?.contextWindow !== configuration.matrix.contextWindow ||
        effective?.baseUrl !== relayUrl ||
        probe.state.thinkingLevel !== model.thinking ||
        !probe.thinkingLevels.includes(model.thinking) ||
        routing?.allow_fallbacks !== false ||
        canonicalJson(routing.only) !== canonicalJson([model.upstream]) ||
        canonicalJson(routing.order) !== canonicalJson([model.upstream])
      ) {
        throw new Error(`Effective model mismatch for ${model.key}: ${JSON.stringify(probe)}`);
      }
      if (
        !probe.commands.some(
          (command) => command.name === "pi-engineer" && command.source === "extension",
        )
      )
        throw new Error(`pi-engineer Extension did not register for ${model.key}`);
      modelResults.push({
        key: model.key,
        model: {
          provider: effective.provider,
          id: effective.id,
          contextWindow: effective.contextWindow,
          baseUrl: effective.baseUrl,
          routing,
        },
        thinking: probe.state.thinkingLevel,
        extensionRegistered: true,
      });
    }

    const relaySocket = join(relayDirectory, "health.sock");
    const relay = await startRelay({
      socketPath: relaySocket,
      model: configuration.matrix.models[0],
      requestLimit: configuration.isolation.relayRequestLimit,
      openRouterUrl: configuration.isolation.openRouterUrl,
      credential,
    });
    const health = await requestUnix(relaySocket);
    await relay.close();
    if (health.status !== 400 || relay.evidence.rejected[0]?.violations?.length === 0)
      throw new Error("Relay rejection health check failed");

    const atomicName = `.preflight-atomic-${randomUUID()}`;
    const atomicStaging = join(campaignDirectory, `${atomicName}-staging`);
    const atomicFinal = join(campaignDirectory, `${atomicName}-final`);
    await mkdir(atomicStaging, { mode: 0o700 });
    await writeFile(join(atomicStaging, "marker"), campaign.fingerprint, { mode: 0o600 });
    await atomicCommitDirectory(atomicStaging, atomicFinal);
    if ((await readFile(join(atomicFinal, "marker"), "utf8")) !== campaign.fingerprint) {
      throw new Error("Same-filesystem atomic commit probe failed");
    }
    await rm(atomicFinal, { recursive: true });

    const record = {
      schemaVersion: 1,
      campaignFingerprint: campaign.fingerprint,
      result: "PASS",
      checkedAt: new Date().toISOString(),
      pi: { packageVersion: packageJson.version, cliVersion: versionResult.stdout.trim() },
      tools: toolVersions,
      configuration: {
        contextWindow: configuration.matrix.contextWindow,
        credentialSource: "PI_ENGINEER_EVAL_OPENROUTER_API_KEY",
        fallbackAllowed: false,
        relayUrl,
      },
      isolation: isolationResult,
      models: modelResults,
      relay: { rejectedProbe: relay.evidence.rejected[0] },
      atomicCommit: true,
    };
    await atomicWriteImmutable(path, record);
    return { reused: false, record };
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function executeLogicalRun({
  configuration,
  campaign,
  campaignDirectory,
  model,
  evaluationCase,
  run,
  attemptNumber,
  credential,
  packageDirectory,
}) {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "pi-engineer-eval-"));
  const workspace = join(temporaryRoot, "workspace");
  const agentDirectory = join(temporaryRoot, "agent");
  const relayDirectory = join(temporaryRoot, "relay");
  const relaySocket = join(relayDirectory, "openrouter.sock");
  let relay;
  try {
    await Promise.all([
      cp(join(evaluationRoot, "fixtures", evaluationCase.fixture, "seed"), workspace, {
        recursive: true,
      }),
      mkdir(relayDirectory, { recursive: true, mode: 0o700 }),
    ]);
    await createAgentDirectory(
      agentDirectory,
      configuration.models,
      `http://127.0.0.1:${configuration.isolation.relayPort}/api/v1`,
    );
    const before = await snapshotTree(workspace);
    relay = await startRelay({
      socketPath: relaySocket,
      model,
      requestLimit: configuration.isolation.relayRequestLimit,
      openRouterUrl: configuration.isolation.openRouterUrl,
      credential,
    });
    const piArguments = buildPiArguments({
      evaluationCase,
      model,
      guest: configuration.isolation.guest,
    });
    const startedAt = new Date().toISOString();
    const processResult = await runSandboxed({
      workspace,
      agentDirectory,
      packageDirectory,
      relayDirectory,
      guest: configuration.isolation.guest,
      relayPort: configuration.isolation.relayPort,
      piArguments,
      timeoutMs: configuration.isolation.runTimeoutMs,
    });
    const relayEvidence = structuredClone(relay.evidence);
    await relay.close();
    relay = undefined;
    const after = await snapshotTree(workspace);
    const trace = parseTrace(processResult.stdout);
    const infrastructure = evaluateInfrastructure({ processResult, trace, relayEvidence });
    const automatic = evaluateAutomatic({ evaluationCase, before, after, trace });
    const record = {
      schemaVersion: 1,
      campaignFingerprint: campaign.fingerprint,
      runId: run.id,
      modelKey: model.key,
      modelId: model.id,
      caseId: evaluationCase.id,
      attempt: attemptNumber,
      startedAt,
      finishedAt: new Date().toISOString(),
      infrastructure: infrastructure.result,
      invalidReasons: infrastructure.reasons,
      automatic: infrastructure.result === "VALID" ? automatic.outcome : null,
      manualReview: "REQUIRED",
      finalText: infrastructure.finalText,
    };
    await writeAttempt(
      campaignDirectory,
      run.id,
      attemptNumber,
      {
        "record.json": record,
        "trace.jsonl": processResult.stdout,
        "stderr.txt": processResult.stderr,
        "process.json": processResult,
        "relay.json": relayEvidence,
        "workspace-before.json": before,
        "workspace-after.json": after,
        "automatic.json": automatic,
      },
      { workspace },
    );
    return record;
  } finally {
    if (relay) await relay.close().catch(() => {});
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

async function executeCampaign({
  configuration,
  campaign,
  campaignDirectory,
  resume,
  concurrency,
  credential,
}) {
  const plan = await planCampaignRuns(campaignDirectory, campaign, resume);
  const temporaryRoot = await mkdtemp(join(tmpdir(), "pi-engineer-campaign-"));
  const packageDirectory = join(temporaryRoot, "package");
  await createPackageSnapshot(packageDirectory);
  try {
    return await runModelWorkers({
      models: configuration.matrix.models,
      concurrency,
      worker: async (model) => {
        const records = [];
        for (const evaluationCase of configuration.manifest.cases) {
          const item = plan.find(
            ({ run }) => run.modelKey === model.key && run.caseId === evaluationCase.id,
          );
          if (item.skip) {
            records.push({ runId: item.run.id, skipped: true });
            continue;
          }
          records.push(
            await executeLogicalRun({
              configuration,
              campaign,
              campaignDirectory,
              model,
              evaluationCase,
              run: item.run,
              attemptNumber: item.attemptNumber,
              credential,
              packageDirectory,
            }),
          );
        }
        return records;
      },
    });
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
  }
}

export async function planCampaignRuns(campaignDirectory, campaign, resume) {
  const plan = [];
  for (const run of campaign.runs) {
    const attempts = await listAttempts(campaignDirectory, run.id);
    const state = validateAttempts(attempts, campaign.fingerprint, run);
    if (!resume && attempts.length > 0)
      throw new Error(`Evidence already exists for ${run.id}; use --resume`);
    plan.push({ run, skip: state.valid === 1, attemptNumber: state.nextAttempt });
  }
  return plan;
}

export async function prepareCampaign() {
  const configuration = await loadConfiguration();
  const identity = await buildCampaignIdentity(configuration);
  const campaign = createCampaign(identity);
  const campaignDirectory = join(evaluationRoot, "results", "system-prompt", campaign.fingerprint);
  return { configuration, campaign, campaignDirectory };
}

export async function main(argv = process.argv.slice(2)) {
  const options = parseArguments(argv);
  const prepared = await prepareCampaign();
  if (options.mode === "dry-run") {
    return {
      mode: "dry-run",
      campaignFingerprint: prepared.campaign.fingerprint,
      suite: prepared.campaign.suite,
      runCount: prepared.campaign.runs.length,
      concurrency: options.concurrency,
      runs: prepared.campaign.runs,
    };
  }
  const credential = loadEvaluationCredential();
  await initializeCampaign(prepared.campaignDirectory, prepared.campaign);
  const preflight = await executePreflight({ ...prepared, credential });
  if (options.mode === "preflight")
    return {
      mode: "preflight",
      campaignFingerprint: prepared.campaign.fingerprint,
      preflight: preflight.reused ? "reused" : "completed",
    };
  const workers = await executeCampaign({
    ...prepared,
    resume: options.resume,
    concurrency: options.concurrency,
    credential,
  });
  return {
    mode: "run",
    campaignFingerprint: prepared.campaign.fingerprint,
    resume: options.resume,
    concurrency: options.concurrency,
    workers,
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    process.stdout.write(`${JSON.stringify(await main(), null, 2)}\n`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
