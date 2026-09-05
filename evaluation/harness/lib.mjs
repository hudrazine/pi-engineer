import { createHash, randomUUID } from "node:crypto";
import { cp, lstat, mkdir, readFile, readdir, realpath, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const EVALUATION_SCHEMA_VERSION = 1;
export const HARNESS_PROTOCOL_VERSION = 2;

const harnessDirectory = dirname(fileURLToPath(import.meta.url));
export const repositoryRoot = resolve(harnessDirectory, "../..");
export const evaluationRoot = resolve(repositoryRoot, "evaluation");

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .toSorted((left, right) => left.localeCompare(right))
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function loadConfiguration() {
  const [matrix, models, isolation, manifest] = await Promise.all([
    readJson(join(evaluationRoot, "config/matrix.json")),
    readJson(join(evaluationRoot, "config/models.json")),
    readJson(join(evaluationRoot, "config/isolation.json")),
    readJson(join(evaluationRoot, "cases/system-prompt.json")),
  ]);
  validateConfiguration({ matrix, models, isolation, manifest });
  return { matrix, models, isolation, manifest };
}

export function validateConfiguration({ matrix, models, isolation, manifest }) {
  if (matrix.schemaVersion !== EVALUATION_SCHEMA_VERSION)
    throw new Error("Unsupported matrix schema");
  if (manifest.schemaVersion !== EVALUATION_SCHEMA_VERSION)
    throw new Error("Unsupported case schema");
  if (manifest.suite !== "system-prompt")
    throw new Error("Only the system-prompt suite is supported");
  if (matrix.piVersion !== "0.85.0" || matrix.provider !== "openrouter") {
    throw new Error("The evaluation requires Pi 0.85.0 and OpenRouter");
  }
  if (
    matrix.contextWindow !== 258400 ||
    matrix.models.length !== 3 ||
    manifest.cases.length !== 9
  ) {
    throw new Error(
      "The evaluation matrix must contain 3 models, 9 cases, and contextWindow 258400",
    );
  }
  const keys = new Set();
  const ids = new Set();
  for (const model of matrix.models) {
    if (keys.has(model.key) || ids.has(model.id)) throw new Error("Duplicate model key or id");
    keys.add(model.key);
    ids.add(model.id);
    const override = models.providers?.openrouter?.modelOverrides?.[model.id];
    const routing = override?.compat?.openRouterRouting;
    if (!override || override.contextWindow !== matrix.contextWindow) {
      throw new Error(`Missing exact context override for ${model.id}`);
    }
    if (
      routing?.allow_fallbacks !== false ||
      canonicalJson(routing.only) !== canonicalJson([model.upstream]) ||
      canonicalJson(routing.order) !== canonicalJson([model.upstream])
    ) {
      throw new Error(`Missing exact routing override for ${model.id}`);
    }
  }
  if (models.providers?.openrouter?.compat?.openRouterRouting?.allow_fallbacks !== false) {
    throw new Error("Provider-level fallback prohibition is missing");
  }
  const caseIds = new Set();
  for (const item of manifest.cases) {
    for (const key of Object.keys(item.automatic)) {
      if (key.endsWith("CommandPatterns")) {
        throw new Error(`Command pattern gates are unsupported: ${item.id}/${key}`);
      }
    }
    if (caseIds.has(item.id)) throw new Error(`Duplicate case id: ${item.id}`);
    caseIds.add(item.id);
    if (!["base", "project", "skill", "append"].includes(item.profile)) {
      throw new Error(`Unknown case profile: ${item.profile}`);
    }
  }
  if (!Number.isInteger(isolation.relayRequestLimit) || isolation.relayRequestLimit < 1) {
    throw new Error("relayRequestLimit must be a positive integer");
  }
}

async function walkTree(root, current, entries, seenRealPaths) {
  const names = (await readdir(current)).toSorted((left, right) => left.localeCompare(right));
  for (const name of names) {
    const path = join(current, name);
    const logical = relative(root, path).split(sep).join("/");
    const info = await lstat(path);
    if (info.isSymbolicLink()) {
      const target = await realpath(path);
      const targetInfo = await stat(target);
      entries.push({ path: logical, type: "symlink", target, mode: info.mode & 0o777 });
      if (targetInfo.isDirectory() && !seenRealPaths.has(target)) {
        seenRealPaths.add(target);
        await walkTree(target, target, entries, seenRealPaths);
      } else if (targetInfo.isFile()) {
        entries.push({
          path: `${logical}#target`,
          type: "file",
          sha256: sha256(await readFile(target)),
          mode: targetInfo.mode & 0o777,
        });
      }
    } else if (info.isDirectory()) {
      entries.push({ path: logical, type: "directory", mode: info.mode & 0o777 });
      await walkTree(root, path, entries, seenRealPaths);
    } else if (info.isFile()) {
      entries.push({
        path: logical,
        type: "file",
        sha256: sha256(await readFile(path)),
        mode: info.mode & 0o777,
      });
    }
  }
}

export async function snapshotTree(root) {
  const entries = [];
  await walkTree(root, root, entries, new Set([await realpath(root)]));
  return entries.toSorted((a, b) => a.path.localeCompare(b.path));
}

export async function hashTree(root) {
  return sha256(canonicalJson(await snapshotTree(root)));
}

export async function hashFiles(paths) {
  const values = [];
  for (const path of paths.toSorted((left, right) => left.localeCompare(right))) {
    values.push({
      path: relative(repositoryRoot, path).split(sep).join("/"),
      sha256: sha256(await readFile(path)),
    });
  }
  return sha256(canonicalJson(values));
}

export async function listHarnessModules() {
  return (await readdir(harnessDirectory))
    .filter((name) => name.endsWith(".mjs") || name.endsWith(".mts"))
    .map((name) => join(harnessDirectory, name));
}

export async function buildCampaignIdentity(configuration) {
  const { matrix, models, isolation, manifest } = configuration;
  const packageJson = await readJson(join(repositoryRoot, "package.json"));
  const piPackageJson = await readJson(
    join(repositoryRoot, "node_modules/@earendil-works/pi-coding-agent/package.json"),
  );
  const piCodingAgentRoot = await realpath(
    join(repositoryRoot, "node_modules/@earendil-works/pi-coding-agent"),
  );
  const piAiRoot = await realpath(join(piCodingAgentRoot, "../pi-ai"));
  const runtimeExecutables = [
    process.execPath,
    "/usr/bin/bwrap",
    "/usr/bin/unshare",
    "/usr/sbin/ip",
    "/usr/bin/setpriv",
    "/bin/bash",
  ];
  const sourceHashes = {
    packageSnapshot: sha256(
      canonicalJson({
        src: await snapshotTree(join(repositoryRoot, "src")),
        skills: await snapshotTree(join(repositoryRoot, "skills")),
        packageJson,
      }),
    ),
    fixtures: await hashTree(join(evaluationRoot, "fixtures")),
    harness: await hashFiles(await listHarnessModules()),
    piRuntime: sha256(
      canonicalJson({
        package: piPackageJson,
        codingAgent: await hashTree(piCodingAgentRoot),
        piAi: await hashTree(piAiRoot),
        lockfile: sha256(await readFile(join(repositoryRoot, "pnpm-lock.yaml"))),
      }),
    ),
    runtimeImage: sha256(
      canonicalJson({
        platform: process.platform,
        architecture: process.arch,
        nodeVersion: process.version,
        osRelease: await readFile("/etc/os-release", "utf8"),
        executables: await Promise.all(
          runtimeExecutables.map(async (path) => ({ path, sha256: sha256(await readFile(path)) })),
        ),
      }),
    ),
  };
  return {
    schemaVersion: EVALUATION_SCHEMA_VERSION,
    protocolVersion: HARNESS_PROTOCOL_VERSION,
    suite: "system-prompt",
    matrix,
    models,
    isolation,
    manifest,
    sourceHashes,
  };
}

export function createCampaign(identity) {
  const fingerprint = sha256(canonicalJson(identity));
  const runs = identity.matrix.models.flatMap((model) =>
    identity.manifest.cases.map((evaluationCase) => ({
      id: `${model.key}--${evaluationCase.id}`,
      modelKey: model.key,
      modelId: model.id,
      caseId: evaluationCase.id,
    })),
  );
  return {
    schemaVersion: EVALUATION_SCHEMA_VERSION,
    suite: "system-prompt",
    fingerprint,
    identity,
    runs,
  };
}

export async function createPackageSnapshot(destination) {
  await mkdir(destination, { recursive: true, mode: 0o700 });
  await Promise.all([
    cp(join(repositoryRoot, "src"), join(destination, "src"), { recursive: true }),
    cp(join(repositoryRoot, "skills"), join(destination, "skills"), { recursive: true }),
    cp(join(repositoryRoot, "package.json"), join(destination, "package.json")),
  ]);
}

export async function createAgentDirectory(directory, modelsConfiguration, relayBaseUrl) {
  await mkdir(join(directory, "sessions"), { recursive: true, mode: 0o700 });
  const isolated = structuredClone(modelsConfiguration);
  isolated.providers.openrouter.baseUrl = relayBaseUrl;
  isolated.providers.openrouter.apiKey = "evaluation-relay-placeholder";
  await writeFile(join(directory, "models.json"), `${JSON.stringify(isolated, null, 2)}\n`, {
    mode: 0o600,
  });
  await writeFile(join(directory, "settings.json"), "{}\n", { mode: 0o600 });
}

export function sandboxEnvironment(guest) {
  return {
    HOME: guest.home,
    XDG_CONFIG_HOME: `${guest.home}/.config`,
    XDG_CACHE_HOME: `${guest.home}/.cache`,
    XDG_DATA_HOME: `${guest.home}/.local/share`,
    PI_CODING_AGENT_DIR: guest.agent,
    PI_CODING_AGENT_SESSION_DIR: `${guest.agent}/sessions`,
    PI_OFFLINE: "1",
    PI_TELEMETRY: "0",
    LANG: "C.UTF-8",
    LC_ALL: "C.UTF-8",
    PATH: `${guest.runtime}:/usr/local/bin:/usr/bin:/bin`,
    SHELL: "/bin/bash",
  };
}

export function buildPiArguments({ evaluationCase, model, guest }) {
  const args = [
    `${guest.runtime}/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js`,
    "--approve",
    "--offline",
    "--no-extensions",
    "--extension",
    `${guest.package}/src/index.ts`,
    "--no-prompt-templates",
    "--no-themes",
    "--no-session",
    "--session-dir",
    `${guest.agent}/sessions`,
    "--provider",
    "openrouter",
    "--model",
    model.id,
    "--thinking",
    model.thinking,
    "--api-key",
    "evaluation-relay-placeholder",
    "--tools",
    "read,bash,edit,write",
    "--mode",
    "json",
    "--print",
  ];
  if (evaluationCase.profile === "project") {
    args.push("--no-skills");
  } else if (evaluationCase.profile === "skill") {
    args.push(
      "--no-context-files",
      "--no-skills",
      "--skill",
      `${guest.package}/skills/${evaluationCase.skill}/SKILL.md`,
    );
  } else {
    args.push("--no-context-files", "--no-skills");
  }
  if (evaluationCase.profile === "append") {
    args.push("--append-system-prompt", evaluationCase.appendSystemPrompt);
  }
  args.push("--", evaluationCase.prompt);
  if (args.includes("--system-prompt"))
    throw new Error("Evaluation must not override the system prompt");
  return args;
}

export function makeOpaqueDirectoryName() {
  return randomUUID();
}
