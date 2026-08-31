import assert from "node:assert/strict";
import test from "node:test";
import { parseLimit } from "../src/limits.js";

test("parses limits at the supported boundary", () => {
  assert.equal(parseLimit("1"), 1);
  assert.equal(parseLimit("100"), 100);
  assert.throws(() => parseLimit("0"), RangeError);
  assert.throws(() => parseLimit("101"), RangeError);
});
