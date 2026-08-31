import assert from "node:assert/strict";
import test from "node:test";
import { APP_LABEL } from "../src/banner.js";

test("exports the requested application label", () => {
  assert.equal(APP_LABEL, "Acme Control Center");
});
