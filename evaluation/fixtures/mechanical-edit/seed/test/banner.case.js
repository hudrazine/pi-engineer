import assert from "node:assert/strict";
import test from "node:test";
import { APP_LABEL } from "../src/banner.js";

test("exports a non-empty application label", () => {
  assert.equal(typeof APP_LABEL, "string");
  assert.ok(APP_LABEL.length > 0);
});
