/* oxlint-disable typescript/no-explicit-any */

export function loadEvaluationCredential(environment?: NodeJS.ProcessEnv): string;
export function extractSystemPrompt(body: any): string | undefined;
export function validateRelayRequest(options: any): {
  violations: string[];
  systemPrompt?: string;
  systemPromptHash?: string;
};
export function startRelay(options: any): Promise<any>;
