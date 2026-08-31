import type { BuildSystemPromptOptions, ExtensionAPI } from "@earendil-works/pi-coding-agent";
import packageJson from "../package.json" with { type: "json" };
import { buildPiEngineerPrompt } from "./system-prompt.ts";

function hasCustomPrompt(options: BuildSystemPromptOptions): boolean {
  return Boolean(options.customPrompt);
}

function getStatusMessage(options: BuildSystemPromptOptions): string {
  const version = `version ${packageJson.version}`;
  return hasCustomPrompt(options)
    ? `pi-engineer inactive: an explicit custom system prompt is active (${version}).`
    : `pi-engineer active (${version}).`;
}

export default function piEngineer(pi: ExtensionAPI): void {
  let customPromptConflictNotified = false;

  pi.on("before_agent_start", (event, ctx) => {
    if (hasCustomPrompt(event.systemPromptOptions)) {
      if (ctx.hasUI && !customPromptConflictNotified) {
        ctx.ui.notify(
          "pi-engineer is inactive because an explicit custom system prompt is active.",
          "warning",
        );
        customPromptConflictNotified = true;
      }
      return {};
    }

    return { systemPrompt: buildPiEngineerPrompt(event.systemPromptOptions) };
  });

  pi.registerCommand("pi-engineer", {
    description: "Show pi-engineer status",
    async handler(args, ctx) {
      if (args.trim() !== "status") {
        ctx.ui.notify("Usage: /pi-engineer status", "warning");
        return;
      }

      ctx.ui.notify(getStatusMessage(ctx.getSystemPromptOptions()), "info");
    },
  });
}
