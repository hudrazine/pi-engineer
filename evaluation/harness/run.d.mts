/* oxlint-disable typescript/no-explicit-any */

export function parseArguments(argv: string[]): {
  mode: string;
  resume: boolean;
  concurrency: number;
};
export function changedPaths(before: any[], after: any[]): string[];
export function parseTrace(stdout: string): { events: any[]; errors: string[] };
export function evaluateAutomatic(options: any): any;
export function evaluateInfrastructure(options: any): any;
export function executePreflight(options: any): Promise<any>;
export function planCampaignRuns(
  campaignDirectory: string,
  campaign: any,
  resume: boolean,
): Promise<any[]>;
export function prepareCampaign(): Promise<any>;
export function main(argv?: string[]): Promise<any>;
