import assert from "node:assert/strict";
import test from "node:test";
import { transformLegacyRecord } from "../src/hooks.js";

test("transforms a legacy record", () => {
  assert.deepEqual(transformLegacyRecord({ legacyId: "old-1", payload: 3 }), {
    id: "old-1",
    value: 3,
  });
});
