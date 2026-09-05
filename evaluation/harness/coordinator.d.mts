/* oxlint-disable typescript/no-explicit-any */

export function runModelWorkers(options: {
  models: any[];
  concurrency: number;
  worker: (model: any) => Promise<any>;
}): Promise<any[]>;
