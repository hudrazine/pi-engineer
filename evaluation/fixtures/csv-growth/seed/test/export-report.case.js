import assert from "node:assert/strict";
import test from "node:test";
import { exportReport } from "../src/export-report.js";

test("exports JSON", () => {
  assert.equal(exportReport([{ name: "Ada", score: 10 }], "json"), '[{"name":"Ada","score":10}]');
});
