import assert from "node:assert/strict";
import { normalizeTag } from "./src/tags.js";

assert.equal(normalizeTag("  Release Notes "), "release-notes");
