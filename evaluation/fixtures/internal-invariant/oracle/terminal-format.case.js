import assert from "node:assert/strict";
import test from "node:test";
import { summarizeValidatedOrder } from "../src/orders.js";

test("uses the requested terminal-order display", () => {
  assert.equal(summarizeValidatedOrder({ id: "o-1", status: "paid" }), "#o-1 [paid]");
  assert.equal(summarizeValidatedOrder({ id: "o-2", status: "cancelled" }), "#o-2 [cancelled]");
});
