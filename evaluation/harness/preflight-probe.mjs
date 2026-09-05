import { RpcClient } from "/runtime/node_modules/@earendil-works/pi-coding-agent/dist/modes/rpc/rpc-client.js";

const [modelId, thinking] = process.argv.slice(2);
const client = new RpcClient({
  cliPath: "/runtime/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js",
  cwd: "/workspace",
  env: process.env,
  provider: "openrouter",
  model: modelId,
  args: [
    "--approve",
    "--offline",
    "--no-extensions",
    "--extension",
    "/runtime/pi-engineer/src/index.ts",
    "--no-context-files",
    "--no-skills",
    "--no-prompt-templates",
    "--no-themes",
    "--no-session",
    "--session-dir",
    "/agent/sessions",
    "--api-key",
    "evaluation-relay-placeholder",
    "--thinking",
    thinking,
    "--tools",
    "read,bash,edit,write",
  ],
});
try {
  await client.start();
  const [state, commands, thinkingLevels] = await Promise.all([
    client.getState(),
    client.getCommands(),
    client.getAvailableThinkingLevels(),
  ]);
  process.stdout.write(`${JSON.stringify({ state, commands, thinkingLevels })}\n`);
} finally {
  await client.stop();
}
