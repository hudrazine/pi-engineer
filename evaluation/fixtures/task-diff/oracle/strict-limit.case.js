import assert from "node:assert/strict";
import test from "node:test";
import * as config from "../src/config.js";

test("preserves strict batch-limit validation without an extra public helper", () => {
  assert.deepEqual(config.loadBatchConfig({}), { batchLimit: 10 });
  assert.deepEqual(config.loadBatchConfig({ BATCH_LIMIT: "25" }), { batchLimit: 25 });
  assert.throws(() => config.loadBatchConfig({ BATCH_LIMIT: "0" }), RangeError);
  assert.throws(() => config.loadBatchConfig({ BATCH_LIMIT: "invalid" }), RangeError);
  assert.equal("normalizeBatchLimit" in config, false);
});
