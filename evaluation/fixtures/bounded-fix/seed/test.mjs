import assert from "node:assert/strict";
import { defaultPageSize } from "./src/config.js";

assert.equal(defaultPageSize, 25);
