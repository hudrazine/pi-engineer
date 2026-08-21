import { getDocsPath, getExamplesPath, getReadmePath } from "@earendil-works/pi-coding-agent";
import type { Skill } from "@earendil-works/pi-coding-agent";
import { createHash } from "node:crypto";
import { expect, test } from "vite-plus/test";
import {
  buildPiEngineerPrompt,
  PORTABLE_CORE,
  PORTABLE_CORE_VERSION,
} from "../src/system-prompt.ts";

const skill: Skill = {
  name: "release-check",
  description: "Prepare a release",
  filePath: "C:/skills/release-check/SKILL.md",
  baseDir: "C:/skills/release-check",
  disableModelInvocation: false,
  sourceInfo: {
    path: "C:/skills/release-check/SKILL.md",
    source: "test",
    scope: "project",
    origin: "top-level",
  },
};

test("keeps the accepted Portable Core v0.5 bytes stable", () => {
  expect(PORTABLE_CORE_VERSION).toBe("0.5");
  expect(createHash("sha256").update(PORTABLE_CORE).digest("hex")).toBe(
    "7b99d53dd6dd2ab2db0aa69006e592b80f1086a89056398cb92f4ab6d89ce001",
  );
});

test("clarifies unresolved consequential choices without suppressing local autonomy", () => {
  expect(PORTABLE_CORE).toContain(
    "An explicit request to implement does not resolve a consequential choice that the request explicitly leaves undecided. Stop before editing and request that decision; continue to choose minor, local, reversible details yourself.",
  );
});

test("defines protected roots, their non-overridable boundary, and safe alternatives", () => {
  expect(PORTABLE_CORE).toContain(
    "Treat a home directory, filesystem root, workspace root, repository root, or another broad collection of user data as a protected root. Explicit user authorization does not make a protected root a valid target for recursive destruction.",
  );
  expect(PORTABLE_CORE).toContain(
    "If a request targets a protected root, stop before invoking a destructive tool. Explain the boundary and ask for a narrower child target. If the user intends to remove the entire workspace, direct them to do so outside the current agent session.",
  );
});

test("assembles the Portable Core and runtime sections in the accepted order", () => {
  const prompt = buildPiEngineerPrompt({
    cwd: "C:\\workspace\\pi-engineer",
    selectedTools: ["bash"],
    toolSnippets: { bash: "Run commands" },
    promptGuidelines: ["Keep command output focused", "Keep command output focused", "  "],
    appendSystemPrompt: "Use the repository release process.",
  });

  expect(prompt).toBe(`${PORTABLE_CORE}

Available tools:
- bash: Run commands

Tool guidelines:
- Use available shell utilities for repository discovery and prefer efficient tools such as rg when available.
- Do not repurpose standard environment variables for task-local values. Use explicit task-specific paths where safety matters, and avoid interpolation that could execute text or expose sensitive values unintentionally.
- Keep command output focused

Pi documentation:
- README: ${getReadmePath()}
- Documentation: ${getDocsPath()}
- Examples: ${getExamplesPath()}
Before making Pi-specific implementation decisions, consult relevant installed Markdown documentation and follow its references.

Use the repository release process.

Current working directory: C:/workspace/pi-engineer`);
});

test("preserves project context order and includes Pi-formatted Skills only with read", () => {
  const options = {
    cwd: "/workspace/pi-engineer",
    selectedTools: ["read"],
    contextFiles: [
      { path: "C:/workspace/AGENTS.md", content: "First instructions" },
      { path: "C:/workspace/subdir/AGENTS.md", content: "Second instructions" },
    ],
    skills: [skill],
  };

  const prompt = buildPiEngineerPrompt(options);

  expect(prompt).toContain(`<project_context>

Project-specific instructions and guidelines:

<project_instructions path="C:/workspace/AGENTS.md">
First instructions
</project_instructions>

<project_instructions path="C:/workspace/subdir/AGENTS.md">
Second instructions
</project_instructions>

</project_context>`);
  expect(prompt.indexOf("First instructions")).toBeLessThan(prompt.indexOf("Second instructions"));
  expect(prompt).toContain("<available_skills>");
  expect(prompt).toContain("release-check");
  expect(buildPiEngineerPrompt({ ...options, selectedTools: [] })).not.toContain("release-check");
});

test("omits empty runtime sections and produces deterministic output", () => {
  const options = { cwd: "C:\\workspace", selectedTools: [], promptGuidelines: [" ", "\n"] };
  const first = buildPiEngineerPrompt(options);

  expect(first).toBe(buildPiEngineerPrompt(options));
  expect(first).not.toContain("Available tools:");
  expect(first).not.toContain("Tool guidelines:");
});
