export async function runModelWorkers({ models, concurrency, worker }) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 3) {
    throw new Error("concurrency must be an integer from 1 to 3");
  }
  const queue = [...models];
  const results = [];
  const errors = [];
  async function consume() {
    while (queue.length > 0) {
      const model = queue.shift();
      try {
        results.push({ modelKey: model.key, value: await worker(model) });
      } catch (error) {
        errors.push({ modelKey: model.key, error });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, models.length) }, consume));
  if (errors.length > 0) {
    const aggregate = new AggregateError(
      errors.map(({ error }) => error),
      `Model workers failed: ${errors.map(({ modelKey }) => modelKey).join(", ")}`,
    );
    aggregate.workerErrors = errors;
    throw aggregate;
  }
  return results;
}
