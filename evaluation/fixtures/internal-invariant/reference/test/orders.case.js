import assert from "node:assert/strict";
import test from "node:test";
import { parseTerminalOrder, summarizeValidatedOrder } from "../src/orders.js";

test("validates terminal orders at the input boundary", () => {
  assert.deepEqual(parseTerminalOrder({ id: "o-1", status: "paid" }), {
    id: "o-1",
    status: "paid",
  });
  assert.throws(() => parseTerminalOrder({ id: "o-2", status: "pending" }), TypeError);
});

test("summarizes a validated order", () => {
  assert.equal(summarizeValidatedOrder({ id: "o-1", status: "paid" }), "#o-1 [paid]");
});
