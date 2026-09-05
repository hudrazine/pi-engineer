/* oxlint-disable typescript/no-explicit-any */

export const EVALUATION_SCHEMA_VERSION: number;
export const HARNESS_PROTOCOL_VERSION: number;
export const repositoryRoot: string;
export const evaluationRoot: string;
export function canonicalJson(value: unknown): string;
export function sha256(value: string | NodeJS.ArrayBufferView): string;
export function readJson(path: string): Promise<any>;
export function loadConfiguration(): Promise<any>;
export function validateConfiguration(configuration: any): void;
export function snapshotTree(root: string): Promise<any[]>;
export function hashTree(root: string): Promise<string>;
export function hashFiles(paths: string[]): Promise<string>;
export function listHarnessModules(): Promise<string[]>;
export function buildCampaignIdentity(configuration: any): Promise<any>;
export function createCampaign(identity: any): any;
export function createPackageSnapshot(destination: string): Promise<void>;
export function createAgentDirectory(
  directory: string,
  models: any,
  relayBaseUrl: string,
): Promise<void>;
export function sandboxEnvironment(guest: any): Record<string, string>;
export function buildPiArguments(options: any): string[];
export function makeOpaqueDirectoryName(): string;
