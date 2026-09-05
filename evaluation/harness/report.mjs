import { mkdir, open, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { canonicalJson } from "./lib.mjs";
import { listAttempts, validateAttempts } from "./evidence.mjs";
import { prepareCampaign } from "./run.mjs";

async function writeIfAbsent(path, value) {
  await mkdir(dirname(path), { recursive: true, mode: 0o700 });
  const handle = await open(path, "wx", 0o600);
  try {
    await handle.writeFile(`${JSON.stringify(value, null, 2)}\n`);
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function writeDerived(path, value) {
  const temporary = `${path}.tmp-${process.pid}`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  await rename(temporary, path);
}

export function classifyCase(outcomes) {
  const passes = outcomes.filter((outcome) => outcome === "PASS").length;
  if (passes === 3) return "STRONG_SUPPORT";
  if (passes === 2) return "SUPPORTED_WITH_MODEL_LIMITATION";
  if (outcomes.every((outcome) => outcome === "PASS" || outcome === "FAIL"))
    return "RECONSIDER_PROMPT_OR_CASE";
  return "INCOMPLETE";
}

export function reviewedOutcome(automatic, review, runId) {
  if (review.outcome === "UNREVIEWED") return "INCOMPLETE";
  if (review.outcome !== "PASS" && review.outcome !== "FAIL")
    throw new Error(`Unknown manual outcome for ${runId}`);
  if (typeof review.evidence !== "string" || review.evidence.trim().length === 0)
    throw new Error(`Manual evidence is required for ${runId}`);
  return automatic === "FAIL" || review.outcome === "FAIL" ? "FAIL" : "PASS";
}

export async function buildReport() {
  const { configuration, campaign, campaignDirectory } = await prepareCampaign();
  const storedCampaign = JSON.parse(
    await readFile(join(campaignDirectory, "campaign.json"), "utf8"),
  );
  if (canonicalJson(storedCampaign) !== canonicalJson(campaign))
    throw new Error("Campaign identity mismatch");
  const preflight = JSON.parse(await readFile(join(campaignDirectory, "preflight.json"), "utf8"));
  if (preflight.campaignFingerprint !== campaign.fingerprint || preflight.result !== "PASS")
    throw new Error("A matching successful preflight is required");

  const reviewPath = join(campaignDirectory, "reviews.json");
  try {
    await readFile(reviewPath);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await writeIfAbsent(reviewPath, {
      schemaVersion: 1,
      campaignFingerprint: campaign.fingerprint,
      reviews: campaign.runs.map((run) => ({
        runId: run.id,
        outcome: "UNREVIEWED",
        evidence: "",
        criteria: configuration.manifest.cases.find((item) => item.id === run.caseId)
          .manualCriteria,
      })),
    });
  }
  const reviews = JSON.parse(await readFile(reviewPath, "utf8"));
  if (reviews.campaignFingerprint !== campaign.fingerprint)
    throw new Error("Manual review campaign mismatch");
  const reviewByRun = new Map(reviews.reviews.map((review) => [review.runId, review]));
  if (
    reviewByRun.size !== campaign.runs.length ||
    campaign.runs.some((run) => !reviewByRun.has(run.id))
  )
    throw new Error("Manual review coverage mismatch");

  const results = [];
  for (const run of campaign.runs) {
    const attempts = await listAttempts(campaignDirectory, run.id);
    const state = validateAttempts(attempts, campaign.fingerprint, run);
    const validAttempt = attempts.find(({ record }) => record.infrastructure === "VALID");
    const review = reviewByRun.get(run.id);
    let outcome = "INVALID";
    if (state.valid === 1) outcome = reviewedOutcome(validAttempt.record.automatic, review, run.id);
    results.push({
      ...run,
      infrastructure: state.valid === 1 ? "VALID" : "INVALID",
      automatic: validAttempt?.record.automatic ?? null,
      manual: review.outcome,
      outcome,
      attemptCount: attempts.length,
      evidence: review.evidence,
      toolEvidencePath: validAttempt
        ? `attempts/${run.id}/${validAttempt.name}/automatic.json`
        : null,
    });
  }
  const cases = configuration.manifest.cases.map((evaluationCase) => {
    const caseResults = configuration.matrix.models.map((model) =>
      results.find(
        (result) => result.caseId === evaluationCase.id && result.modelKey === model.key,
      ),
    );
    return {
      caseId: evaluationCase.id,
      outcomes: Object.fromEntries(caseResults.map((result) => [result.modelKey, result.outcome])),
      assessment: classifyCase(caseResults.map((result) => result.outcome)),
    };
  });
  const report = {
    schemaVersion: 1,
    automaticScope:
      "Workspace state and tool presence only; command semantics require manual review.",
    campaignFingerprint: campaign.fingerprint,
    generatedAt: new Date().toISOString(),
    complete: results.every(
      (result) =>
        result.infrastructure === "VALID" &&
        (result.outcome === "PASS" || result.outcome === "FAIL"),
    ),
    counts: Object.fromEntries(
      ["PASS", "FAIL", "INVALID", "INCOMPLETE"].map((outcome) => [
        outcome,
        results.filter((result) => result.outcome === outcome).length,
      ]),
    ),
    results,
    cases,
  };
  await writeDerived(join(campaignDirectory, "report.json"), report);
  return report;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  try {
    process.stdout.write(`${JSON.stringify(await buildReport(), null, 2)}\n`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
}
