import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("defines a bounded TaskQueue MVP", async () => {
  const specification = await readFile(new URL("../SPEC.md", import.meta.url), "utf8");

  assert.match(specification, /Implement `TaskQueue`/);
  assert.match(specification, /explicit non-goals/);
});
