import { parseLimit } from "./limits.js";

export function loadBatchConfig(env) {
  return { batchLimit: parseLimit(env.BATCH_LIMIT ?? "10") };
}
