import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig, parseBoundedInteger } from "../src/config.js";

test("loads the default port", () => {
  assert.equal(loadConfig({}).port, 3000);
});

test("parses bounded integers", () => {
  assert.equal(parseBoundedInteger("4", { name: "COUNT", min: 0, max: 10 }), 4);
  assert.throws(() => parseBoundedInteger("11", { name: "COUNT", min: 0, max: 10 }), /COUNT/);
});
