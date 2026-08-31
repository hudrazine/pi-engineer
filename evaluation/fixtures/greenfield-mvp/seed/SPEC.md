# Task Queue MVP

Implement `TaskQueue` in `src/task-queue.js`.

The public API is:

- `enqueue(task)` appends a string task.
- `dequeue()` removes and returns the oldest task, or `undefined` when empty.
- the `size` getter returns the current number of tasks.

Reject non-string tasks with `TypeError`. Preserve FIFO order.

Persistence, concurrency, retries, priorities, events, plugins, configuration, logging, metrics, and compatibility layers are explicit non-goals.
