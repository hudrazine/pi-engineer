/* oxlint-disable typescript/no-explicit-any */

export function classifyCase(outcomes: string[]): string;
export function reviewedOutcome(
  automatic: string,
  review: { outcome: string; evidence?: string },
  runId: string,
): string;
export function buildReport(): Promise<any>;
