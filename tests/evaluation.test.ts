/* oxlint-disable typescript/no-unsafe-type-assertion -- Evaluation JSON is validated by the harness before use. */

import { execFile } from "node:child_process";
import { mkdtemp, readFile, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { expect, test } from "vite-plus/test";
import { runModelWorkers } from "../evaluation/harness/coordinator.mjs";
import {
  initializeCampaign,
  listAttempts,
  validateAttempts,
  writeAttempt,
} from "../evaluation/harness/evidence.mjs";
import {
  buildPiArguments,
  canonicalJson,
  loadConfiguration,
  repositoryRoot,
} from "../evaluation/harness/lib.mjs";
import {
  extractSystemPrompt,
  loadEvaluationCredential,
  startRelay,
  validateRelayRequest,
} from "../evaluation/harness/relay.mjs";
import {
  evaluateAutomatic,
  evaluateInfrastructure,
  executePreflight,
  parseArguments,
  planCampaignRuns,
  prepareCampaign,
} from "../evaluation/harness/run.mjs";

test("defines one 27-run completed-prompt campaign", async () => {
  const { configuration, campaign } = await prepareCampaign();

  expect(configuration.manifest.suite).toBe("system-prompt");
  expect(configuration.manifest.cases).toHaveLength(9);
  expect(configuration.matrix.models).toHaveLength(3);
  expect(configuration.matrix.models).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        key: "luna",
        id: "openai/gpt-5.6-luna",
        thinking: "max",
        upstream: "openai",
      }),
    ]),
  );
  expect(configuration.isolation.runTimeoutMs).toBe(1800000);
  expect(campaign.runs).toHaveLength(27);
  expect(new Set(campaign.runs.map(({ id }: { id: string }) => id)).size).toBe(27);
});

test("loads the real Extension without a system-prompt override and switches context through Pi CLI", async () => {
  const configuration = await loadConfiguration();
  const model = configuration.matrix.models[0];
  const byProfile = Object.fromEntries(
    configuration.manifest.cases.map((evaluationCase: { profile: string }) => [
      evaluationCase.profile,
      buildPiArguments({ evaluationCase, model, guest: configuration.isolation.guest }),
    ]),
  );

  for (const argumentList of Object.values(byProfile) as string[][]) {
    expect(argumentList).toContain("--extension");
    expect(argumentList).toContain("/runtime/pi-engineer/src/index.ts");
    expect(argumentList).not.toContain("--system-prompt");
    expect(argumentList).toContain("--tools");
    expect(argumentList).toContain("read,bash,edit,write");
  }
  expect(byProfile.base).toEqual(expect.arrayContaining(["--no-context-files", "--no-skills"]));
  expect(byProfile.project).toContain("--no-skills");
  expect(byProfile.project).not.toContain("--no-context-files");
  expect(byProfile.skill).toEqual(
    expect.arrayContaining([
      "--no-context-files",
      "--no-skills",
      "--skill",
      "/runtime/pi-engineer/skills/subtractive-code-review/SKILL.md",
    ]),
  );
  expect(byProfile.append).toContain("--append-system-prompt");
});

test("keeps harness identifiers and host paths out of model-visible arguments", async () => {
  const configuration = await loadConfiguration();
  const evaluationCase = {
    ...configuration.manifest.cases[0],
    id: "secret-case-identifier",
    campaignId: "secret-campaign-identifier",
    runId: "secret-run-identifier",
    condition: "secret-condition-identifier",
  };
  const argumentList = buildPiArguments({
    evaluationCase,
    model: configuration.matrix.models[0],
    guest: configuration.isolation.guest,
  });
  const visible = argumentList.join("\n");

  expect(visible).not.toContain("secret-case-identifier");
  expect(visible).not.toContain("secret-campaign-identifier");
  expect(visible).not.toContain("secret-run-identifier");
  expect(visible).not.toContain("secret-condition-identifier");
  expect(visible).not.toContain(repositoryRoot);
});

test("enforces exact OpenRouter routing, fallback prohibition, and request limit", async () => {
  const configuration = await loadConfiguration();
  for (const model of configuration.matrix.models) {
    const body = {
      model: model.id,
      provider: { only: [model.upstream], order: [model.upstream], allow_fallbacks: false },
      messages: [{ role: "system", content: "completed prompt" }],
    };
    expect(
      validateRelayRequest({
        method: "POST",
        path: "/api/v1/chat/completions",
        body,
        model,
        requestNumber: 1,
        requestLimit: 1,
      }).violations,
    ).toEqual([]);
    expect(
      validateRelayRequest({
        method: "POST",
        path: "/api/v1/chat/completions",
        body: { ...body, provider: { only: ["other"], order: ["other"], allow_fallbacks: true } },
        model,
        requestNumber: 2,
        requestLimit: 1,
      }).violations,
    ).toEqual(
      expect.arrayContaining(["request-limit", "fallbacks", "provider-only", "provider-order"]),
    );
  }
  expect(() => loadEvaluationCredential({})).toThrow(/PI_ENGINEER_EVAL_OPENROUTER_API_KEY/);
  expect(loadEvaluationCredential({ PI_ENGINEER_EVAL_OPENROUTER_API_KEY: "dedicated" })).toBe(
    "dedicated",
  );
});

test("accepts completed prompts in system and developer messages", () => {
  expect(extractSystemPrompt({ messages: [{ role: "system", content: "system prompt" }] })).toBe(
    "system prompt",
  );
  expect(
    extractSystemPrompt({ messages: [{ role: "developer", content: "developer prompt" }] }),
  ).toBe("developer prompt");
  expect(extractSystemPrompt({ messages: [{ role: "user", content: "not instructions" }] })).toBe(
    undefined,
  );
});

test("observes Pi 0.85.0 request roles without external inference", async () => {
  const codingAgentRoot = await realpath(
    join(repositoryRoot, "node_modules/@earendil-works/pi-coding-agent"),
  );
  const piAiRoot = await realpath(join(codingAgentRoot, "../pi-ai"));
  const providerModule = pathToFileURL(join(piAiRoot, "dist/providers/openrouter.js")).href;
  const probe = `
const { openrouterProvider } = await import(${JSON.stringify(providerModule)});
const provider = openrouterProvider();
const ids = [
  "openai/gpt-5.6-luna",
  "z-ai/glm-5.3-flash",
  "meta/muse-spark-1.3-contributor",
];
const roles = {};
for (const id of ids) {
  const model = provider.getModels().find((candidate) => candidate.id === id);
  if (!model) throw new Error(\`Missing Pi model: \${id}\`);
  let payload;
  const stream = provider.stream(
    model,
    { systemPrompt: "completed prompt", messages: [], tools: [] },
    {
      apiKey: "local-probe-only",
      maxRetries: 0,
      onPayload(value) {
        payload = value;
      },
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: "local probe stop" } }), {
          status: 400,
          headers: { "content-type": "application/json" },
        }),
    },
  );
  await stream.result();
  roles[id] = {
    role: payload?.messages?.[0]?.role,
    content: payload?.messages?.[0]?.content,
  };
}
process.stdout.write(JSON.stringify(roles));
`;
  const { stdout } = await promisify(execFile)(
    process.execPath,
    ["--input-type=module", "-e", probe],
    { timeout: 5000 },
  );

  expect(JSON.parse(stdout)).toEqual({
    "openai/gpt-5.6-luna": { role: "developer", content: "completed prompt" },
    "z-ai/glm-5.3-flash": { role: "system", content: "completed prompt" },
    "meta/muse-spark-1.3-contributor": { role: "system", content: "completed prompt" },
  });
});

test("records the completed prompt and rejects prompt drift without recording credentials", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pi-engineer-relay-test-"));
  const socketPath = join(directory, "relay.sock");
  const upstream = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end("{}");
  });
  await new Promise<void>((resolve) => upstream.listen(0, "127.0.0.1", resolve));
  const address = upstream.address();
  if (!address || typeof address === "string") throw new Error("Test upstream did not bind TCP");
  const model = { id: "vendor/model", upstream: "vendor/route" };
  const relay = await startRelay({
    socketPath,
    model,
    requestLimit: 3,
    openRouterUrl: `http://127.0.0.1:${address.port}/chat/completions`,
    credential: "dedicated-secret",
  });
  const send = (systemPrompt: string, role: "developer" | "system") =>
    new Promise<number | undefined>((resolve, reject) => {
      const body = JSON.stringify({
        model: model.id,
        provider: {
          only: [model.upstream],
          order: [model.upstream],
          allow_fallbacks: false,
        },
        messages: [{ role, content: systemPrompt }],
      });
      const request = http.request(
        {
          socketPath,
          path: "/api/v1/chat/completions",
          method: "POST",
          headers: {
            "content-type": "application/json",
            "content-length": Buffer.byteLength(body),
          },
        },
        (response) => {
          response.resume();
          response.once("end", () => resolve(response.statusCode));
        },
      );
      request.once("error", reject);
      request.end(body);
    });
  try {
    expect(await send("completed prompt", "developer")).toBe(200);
    expect(await send("changed prompt", "developer")).toBe(400);
    expect(relay.evidence.systemPrompt).toBe("completed prompt");
    expect(relay.evidence.rejected[0].violations).toContain("system-prompt-drift");
    expect(JSON.stringify(relay.evidence)).not.toContain("dedicated-secret");
  } finally {
    await relay.close();
    await new Promise<void>((resolve, reject) =>
      upstream.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(directory, { recursive: true, force: true });
  }
});

test("runs the non-inference preflight in an isolated Pi 0.85.0 environment", async () => {
  const prepared = await prepareCampaign();
  const directory = await mkdtemp(join(tmpdir(), "pi-engineer-preflight-test-"));
  try {
    const result = await executePreflight({
      ...prepared,
      campaignDirectory: directory,
      credential: "not-sent-by-the-preflight",
    });

    expect(result.record.result).toBe("PASS");
    expect(result.record.pi).toEqual({ packageVersion: "0.85.0", cliVersion: "0.85.0" });
    expect(result.record.isolation).toMatchObject({
      hostRepositoryVisible: false,
      hostAuthVisible: false,
      hostTemporaryMarkerVisible: false,
      credentialNames: [],
      effectiveCapabilities: "0000000000000000",
      internetReachable: false,
    });
    expect(result.record.models).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "luna", thinking: "max" }),
        expect.objectContaining({ key: "glm", thinking: "max" }),
        expect.objectContaining({ key: "muse", thinking: "xhigh" }),
      ]),
    );
    expect(
      result.record.models.every(
        ({ model }: { model: { contextWindow: number; routing: { allow_fallbacks: boolean } } }) =>
          model.contextWindow === 258400 && !model.routing.allow_fallbacks,
      ),
    ).toBe(true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("atomically preserves campaign and attempt evidence and admits an INVALID retry", async () => {
  const directory = await mkdtemp(join(tmpdir(), "pi-engineer-evidence-test-"));
  const campaign = { fingerprint: "campaign-a" };
  const run = { id: "luna--case", modelKey: "luna", modelId: "model", caseId: "case" };
  const invalid = {
    campaignFingerprint: campaign.fingerprint,
    runId: run.id,
    modelKey: run.modelKey,
    modelId: run.modelId,
    caseId: run.caseId,
    attempt: 1,
    infrastructure: "INVALID",
    automatic: null,
  };
  try {
    expect(await initializeCampaign(directory, campaign)).toEqual({ created: true });
    expect(await initializeCampaign(directory, campaign)).toEqual({ created: false });
    await expect(initializeCampaign(directory, { fingerprint: "other" })).rejects.toThrow(
      /Campaign identity mismatch/,
    );

    await writeAttempt(directory, run.id, 1, { "record.json": invalid });
    await expect(writeAttempt(directory, run.id, 1, { "record.json": invalid })).rejects.toThrow();
    let attempts = await listAttempts(directory, run.id);
    expect(validateAttempts(attempts, campaign.fingerprint, run)).toEqual({
      valid: 0,
      nextAttempt: 2,
    });
    await expect(
      planCampaignRuns(directory, { fingerprint: campaign.fingerprint, runs: [run] }, false),
    ).rejects.toThrow(/use --resume/);
    expect(
      await planCampaignRuns(directory, { fingerprint: campaign.fingerprint, runs: [run] }, true),
    ).toEqual([{ run, skip: false, attemptNumber: 2 }]);

    await writeAttempt(directory, run.id, 2, {
      "record.json": { ...invalid, attempt: 2, infrastructure: "VALID", automatic: "PASS" },
    });
    attempts = await listAttempts(directory, run.id);
    expect(validateAttempts(attempts, campaign.fingerprint, run)).toEqual({
      valid: 1,
      nextAttempt: 3,
    });
    expect(
      await planCampaignRuns(directory, { fingerprint: campaign.fingerprint, runs: [run] }, true),
    ).toEqual([{ run, skip: true, attemptNumber: 3 }]);
    expect(JSON.parse(await readFile(join(directory, "campaign.json"), "utf8"))).toEqual(campaign);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("limits model workers to three, supports serial execution, and reports partial failure", async () => {
  const models = [{ key: "a" }, { key: "b" }, { key: "c" }];
  let active = 0;
  let maximum = 0;
  const order: string[] = [];
  await runModelWorkers({
    models,
    concurrency: 1,
    worker: async (model: { key: string }) => {
      active += 1;
      maximum = Math.max(maximum, active);
      order.push(model.key);
      await Promise.resolve();
      active -= 1;
    },
  });
  expect(maximum).toBe(1);
  expect(order).toEqual(["a", "b", "c"]);

  const attempted: string[] = [];
  await expect(
    runModelWorkers({
      models,
      concurrency: 3,
      worker: async (model: { key: string }) => {
        attempted.push(model.key);
        if (model.key === "b") throw new Error("worker failure");
      },
    }),
  ).rejects.toThrow(/Model workers failed: b/);
  expect(attempted.toSorted()).toEqual(["a", "b", "c"]);
  expect(() => parseArguments(["--concurrency", "4"])).toThrow(/1 to 3/);
  expect(parseArguments(["--", "--concurrency", "1"])).toMatchObject({ concurrency: 1 });
});

test("separates model behavior FAIL from infrastructure INVALID", () => {
  const before = [{ path: "file.txt", type: "file", sha256: "before", mode: 0o644 }];
  const after = [{ path: "file.txt", type: "file", sha256: "after", mode: 0o644 }];
  const trace = {
    errors: [],
    events: [
      {
        type: "message_end",
        message: {
          role: "assistant",
          content: [{ type: "text", text: "Done" }],
          stopReason: "stop",
        },
      },
      { type: "agent_end" },
    ],
  };
  const automatic = evaluateAutomatic({
    evaluationCase: { automatic: { workspace: "unchanged" } },
    before,
    after,
    trace,
  });
  expect(automatic.outcome).toBe("FAIL");

  const valid = evaluateInfrastructure({
    processResult: { exitCode: 0, signal: null, timedOut: false },
    trace,
    relayEvidence: { accepted: [{ upstreamStatus: 200 }], rejected: [] },
  });
  expect(valid).toMatchObject({ result: "VALID", reasons: [] });

  const invalid = evaluateInfrastructure({
    processResult: { exitCode: 1, signal: null, timedOut: false },
    trace,
    relayEvidence: { accepted: [], rejected: [{ violations: ["model-id"] }] },
  });
  expect(invalid.result).toBe("INVALID");
  expect(invalid.reasons).toEqual(
    expect.arrayContaining(["process-exit", "no-relay-request", "relay-rejection"]),
  );
  expect(canonicalJson({ b: 1, a: 2 })).toBe('{"a":2,"b":1}');
});
import http from "node:http";
