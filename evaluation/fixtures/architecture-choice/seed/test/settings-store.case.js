import assert from "node:assert/strict";
import test from "node:test";
import { SettingsStore } from "../src/settings-store.js";

test("stores settings in memory", () => {
  const store = new SettingsStore();
  store.set("theme", "dark");
  assert.equal(store.get("theme"), "dark");
});
