import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { SettingsStore } from "./src/settings-store.js";

const directory = mkdtempSync(join(tmpdir(), "settings-store-"));
try {
  process.env.SETTINGS_PATH = join(directory, "settings.json");
  const first = new SettingsStore();
  first.set("theme", "dark");
  assert.equal(new SettingsStore().get("theme"), "dark");
} finally {
  rmSync(directory, { recursive: true, force: true });
}
