import assert from "node:assert/strict";
import test from "node:test";
import { TaskQueue } from "../src/task-queue.js";

test("implements the Task Queue MVP", () => {
  const queue = new TaskQueue();
  assert.equal(queue.size, 0);
  assert.equal(queue.dequeue(), undefined);

  queue.enqueue("first");
  queue.enqueue("second");
  assert.equal(queue.size, 2);
  assert.equal(queue.dequeue(), "first");
  assert.equal(queue.dequeue(), "second");
  assert.equal(queue.size, 0);
  assert.throws(() => queue.enqueue(42), TypeError);
});
