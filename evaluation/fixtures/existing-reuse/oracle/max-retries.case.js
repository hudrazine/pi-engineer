import assert from "node:assert/strict";
import test from "node:test";
import { loadConfig } from "../src/config.js";

test("loads and validates MAX_RETRIES", () => {
  assert.deepEqual(loadConfig({}), { port: 3000, maxRetries: 3 });
  assert.deepEqual(loadConfig({ PORT: "8080", MAX_RETRIES: "5" }), {
    port: 8080,
    maxRetries: 5,
  });
  assert.throws(() => loadConfig({ MAX_RETRIES: "-1" }), /MAX_RETRIES/);
  assert.throws(() => loadConfig({ MAX_RETRIES: "11" }), /MAX_RETRIES/);
  assert.throws(() => loadConfig({ MAX_RETRIES: "2.5" }), /MAX_RETRIES/);
});
