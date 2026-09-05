/* oxlint-disable typescript/no-explicit-any */

export function atomicWriteImmutable(path: string, value: unknown): Promise<void>;
export function atomicCommitDirectory(staging: string, final: string): Promise<void>;
export function initializeCampaign(
  directory: string,
  campaign: unknown,
): Promise<{ created: boolean }>;
export function listAttempts(campaignDirectory: string, runId: string): Promise<any[]>;
export function validateAttempts(
  attempts: any[],
  fingerprint: string,
  run: any,
): { valid: number; nextAttempt: number };
export function writeAttempt(
  campaignDirectory: string,
  runId: string,
  attemptNumber: number,
  files: Record<string, unknown>,
  copyDirectories?: Record<string, string>,
): Promise<string>;
