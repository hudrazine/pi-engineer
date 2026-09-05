import {
  cp,
  link,
  mkdir,
  open,
  readFile,
  readdir,
  rename,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import { dirname, join } from "node:path";
import { canonicalJson } from "./lib.mjs";

async function writeExclusive(path, content) {
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.writeFile(content);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

export async function atomicWriteImmutable(path, value) {
  const directory = dirname(path);
  const staging = join(directory, `.staging-${process.pid}-${Date.now()}`);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  try {
    await writeExclusive(
      staging,
      typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
    );
    await link(staging, path);
    await unlink(staging);
  } catch (error) {
    await rm(staging, { force: true });
    throw error;
  }
}

export async function atomicCommitDirectory(staging, final) {
  await mkdir(dirname(final), { recursive: true, mode: 0o700 });
  await rename(staging, final);
}

export async function initializeCampaign(directory, campaign) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, "campaign.json");
  try {
    await atomicWriteImmutable(path, campaign);
    return { created: true };
  } catch (error) {
    if (error.code !== "EEXIST" && error.code !== "ENOTEMPTY") throw error;
    const existing = JSON.parse(await readFile(path, "utf8"));
    if (canonicalJson(existing) !== canonicalJson(campaign))
      throw new Error("Campaign identity mismatch", { cause: error });
    return { created: false };
  }
}

export async function listAttempts(campaignDirectory, runId) {
  const root = join(campaignDirectory, "attempts", runId);
  let names;
  try {
    names = await readdir(root);
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  if (names.some((item) => !/^attempt-\d{3,}$/.test(item))) {
    throw new Error(`Unexpected evidence entry for ${runId}`);
  }
  const orderedNames = names.toSorted((left, right) => left.localeCompare(right));
  const attempts = [];
  for (const [index, name] of orderedNames.entries()) {
    if (name !== `attempt-${String(index + 1).padStart(3, "0")}`) {
      throw new Error(`Non-contiguous evidence attempts for ${runId}`);
    }
    const recordPath = join(root, name, "record.json");
    const record = JSON.parse(await readFile(recordPath, "utf8"));
    attempts.push({ name, directory: join(root, name), record });
  }
  return attempts;
}

export function validateAttempts(attempts, campaignFingerprint, run) {
  let valid = 0;
  for (const [index, attempt] of attempts.entries()) {
    const record = attempt.record;
    if (
      record.campaignFingerprint !== campaignFingerprint ||
      record.runId !== run.id ||
      record.modelKey !== run.modelKey ||
      record.modelId !== run.modelId ||
      record.caseId !== run.caseId ||
      record.attempt !== index + 1
    ) {
      throw new Error(`Attempt identity mismatch for ${run.id}/${attempt.name}`);
    }
    if (!["VALID", "INVALID"].includes(record.infrastructure))
      throw new Error(`Unknown infrastructure result for ${run.id}`);
    if (
      (record.infrastructure === "VALID" && !["PASS", "FAIL"].includes(record.automatic)) ||
      (record.infrastructure === "INVALID" && record.automatic !== null)
    ) {
      throw new Error(`Inconsistent attempt result for ${run.id}`);
    }
    if (record.infrastructure === "VALID") valid += 1;
  }
  if (valid > 1) throw new Error(`Multiple VALID attempts exist for ${run.id}`);
  return { valid, nextAttempt: attempts.length + 1 };
}

export async function writeAttempt(
  campaignDirectory,
  runId,
  attemptNumber,
  files,
  copyDirectories = {},
) {
  const parent = join(campaignDirectory, "attempts", runId);
  const name = `attempt-${String(attemptNumber).padStart(3, "0")}`;
  const final = join(parent, name);
  const stagingRoot = join(campaignDirectory, ".staging");
  const staging = join(stagingRoot, `${runId}-${name}-${process.pid}-${Date.now()}`);
  await mkdir(staging, { recursive: true, mode: 0o700 });
  for (const [relativePath, value] of Object.entries(files)) {
    const path = join(staging, relativePath);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 });
    await writeFile(
      path,
      typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
      { mode: 0o600 },
    );
  }
  for (const [relativePath, source] of Object.entries(copyDirectories)) {
    await cp(source, join(staging, relativePath), { recursive: true });
  }
  await atomicCommitDirectory(staging, final);
  return final;
}
