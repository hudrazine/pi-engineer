import assert from "node:assert/strict";
import test from "node:test";
import { exportReport } from "../src/export-report.js";

test("exports CSV with quoting and preserves JSON", () => {
  const rows = [
    { name: "Ada", note: "first, second" },
    { name: "Lin", note: 'said "hello"' },
  ];
  assert.equal(exportReport(rows, "csv"), 'name,note\nAda,"first, second"\nLin,"said ""hello"""');
  assert.equal(exportReport(rows, "json"), JSON.stringify(rows));
  assert.throws(() => exportReport(rows, "xml"), RangeError);
});
