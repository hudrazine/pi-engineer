export class TaskQueue {
  #tasks = [];

  get size() {
    return this.#tasks.length;
  }

  enqueue(task) {
    if (typeof task !== "string") throw new TypeError("task must be a string");
    this.#tasks.push(task);
  }

  dequeue() {
    return this.#tasks.shift();
  }
}
