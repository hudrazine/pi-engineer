/* oxlint-disable typescript/no-unsafe-type-assertion -- Tests isolate Pi's large public runtime API with partial fakes. */

import type {
  BeforeAgentStartEvent,
  BeforeAgentStartEventResult,
  ExtensionAPI,
  ExtensionContext,
  RegisteredCommand,
} from "@earendil-works/pi-coding-agent";
import { expect, test } from "vite-plus/test";
import piEngineer from "../src/index.ts";

type BeforeAgentStartHandler = (
  event: BeforeAgentStartEvent,
  context: ExtensionContext,
) => Promise<BeforeAgentStartEventResult | void> | BeforeAgentStartEventResult | void;

function registerExtension() {
  let beforeAgentStart: BeforeAgentStartHandler | undefined;
  let command: RegisteredCommand | undefined;
  const pi = {
    on(eventName: string, handler: unknown) {
      if (eventName === "before_agent_start") beforeAgentStart = handler as BeforeAgentStartHandler;
    },
    registerCommand(name: string, registration: RegisteredCommand) {
      if (name === "pi-engineer") command = registration;
    },
  } as unknown as ExtensionAPI;

  piEngineer(pi);
  if (!beforeAgentStart || !command)
    throw new Error("Extension did not register its public Pi hooks");
  return { beforeAgentStart, command };
}

function createEvent(customPrompt?: string): BeforeAgentStartEvent {
  return {
    type: "before_agent_start",
    prompt: "Implement the feature",
    systemPrompt: "Pi default prompt",
    systemPromptOptions: { cwd: "C:\\workspace", selectedTools: [], customPrompt },
  };
}

test("replaces Pi's root prompt only when no explicit custom prompt is active", async () => {
  const { beforeAgentStart } = registerExtension();
  const notifications: Array<{ message: string; type?: string }> = [];
  const context = {
    hasUI: true,
    ui: { notify: (message: string, type?: string) => notifications.push({ message, type }) },
  } as unknown as ExtensionContext;

  const active = await beforeAgentStart(createEvent(), context);
  expect(active?.systemPrompt).toContain("You are a software engineering agent");
  expect((await beforeAgentStart(createEvent(""), context))?.systemPrompt).toContain(
    "You are a software engineering agent",
  );

  expect(await beforeAgentStart(createEvent("Custom root prompt"), context)).toEqual({});
  expect(await beforeAgentStart(createEvent("Custom root prompt"), context)).toEqual({});
  expect(notifications).toEqual([
    {
      message: "pi-engineer is inactive because an explicit custom system prompt is active.",
      type: "warning",
    },
  ]);
});

test("does not notify about a custom prompt when no UI is available", async () => {
  const { beforeAgentStart } = registerExtension();
  const notifications: string[] = [];
  const context = {
    hasUI: false,
    ui: { notify: (message: string) => notifications.push(message) },
  } as unknown as ExtensionContext;

  expect(await beforeAgentStart(createEvent("Custom root prompt"), context)).toEqual({});
  expect(notifications).toEqual([]);
});

test("reports active status, custom prompt precedence, and command usage", async () => {
  const { command } = registerExtension();
  const notifications: Array<{ message: string; type?: string }> = [];
  const context = (customPrompt?: string) =>
    ({
      ui: { notify: (message: string, type?: string) => notifications.push({ message, type }) },
      getSystemPromptOptions: () => ({ cwd: "C:/workspace", customPrompt }),
    }) as unknown as Parameters<RegisteredCommand["handler"]>[1];

  await command.handler("status", context());
  await command.handler("status", context("Custom root prompt"));
  await command.handler("help", context());

  expect(notifications).toEqual([
    { message: "pi-engineer active (package 0.1.0, Portable Core 0.5).", type: "info" },
    {
      message:
        "pi-engineer inactive: an explicit custom system prompt is active (package 0.1.0, Portable Core 0.5).",
      type: "info",
    },
    { message: "Usage: /pi-engineer status", type: "warning" },
  ]);
});
