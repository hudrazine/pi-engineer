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

const acceptedPortableCore = {
  version: "0.6",
  sha256: "fbe65beacd7f3ac4a22bba085ffcd5eeb391c5b9a25ead82ca83b29500a0dfc4",
} as const;

const shellDiscoveryGuideline =
  "Use available shell utilities for repository discovery and prefer efficient tools such as rg when available.";
const shellSafetyGuideline =
  "Do not repurpose standard environment variables for task-local values. Use explicit task-specific paths where safety matters, and avoid interpolation that could execute text or expose sensitive values unintentionally.";

test("keeps the accepted Portable Core bytes stable", () => {
  expect({
    version: PORTABLE_CORE_VERSION,
    sha256: createHash("sha256").update(PORTABLE_CORE).digest("hex"),
  }).toEqual(acceptedPortableCore);
});

test("clarifies unresolved consequential choices without suppressing local autonomy", () => {
  expect(PORTABLE_CORE).toContain(
    "An explicit request to implement does not resolve a consequential choice that the request explicitly leaves undecided. Stop before editing and request that decision; continue to choose minor, local, reversible details yourself.",
  );
});

test("defines the accepted engineering priority and stopping baseline", () => {
  expect(PORTABLE_CORE).toContain(
    `Use this decision priority:

1. Satisfy the current requirement correctly.
2. Preserve applicable contracts, invariants, security controls, required defenses, and verified behavior.
3. Reuse established mechanisms when valid approaches are semantically equivalent.
4. Avoid unsupported complexity and change surface.

Do not optimize code or diff size at the expense of a higher priority.`,
  );
  expect(PORTABLE_CORE).toContain(
    "Once the requested outcome is implemented and verified in proportion to its scope and risk, stop rather than continuing unrelated improvement.",
  );
});

test("keeps implementation and subtractive-review procedures outside the Portable Core", () => {
  for (const proceduralTerm of [
    "Change Envelope",
    "Evidence Gate",
    "DELETE candidate",
    "SIMPLIFY candidate",
    "drift response",
  ]) {
    expect(PORTABLE_CORE).not.toContain(proceduralTerm);
  }
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
    promptGuidelines: ["Keep command output focused"],
    appendSystemPrompt: "Use the repository release process.",
  });

  expect(prompt).toBe(`${PORTABLE_CORE}

Available tools:
- bash: Run commands

Tool guidelines:
- ${shellDiscoveryGuideline}
- ${shellSafetyGuideline}
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

test("uses default tools when selectedTools is omitted", () => {
  const prompt = buildPiEngineerPrompt({
    cwd: "/workspace/pi-engineer",
    toolSnippets: { read: "Read files", write: "Write files" },
    skills: [skill],
  });

  expect(prompt).toContain(`Available tools:
- read: Read files
- write: Write files`);
  expect(prompt).toContain("<available_skills>");
  expect(prompt).toContain("release-check");
});

test("renders snippets only for selected tools and preserves their order", () => {
  const prompt = buildPiEngineerPrompt({
    cwd: "/workspace/pi-engineer",
    selectedTools: ["read", "bash"],
    toolSnippets: { bash: "Run commands", write: "Write files", read: "Read files" },
  });

  expect(prompt).toContain(`Available tools:
- read: Read files
- bash: Run commands`);
  expect(prompt).not.toContain("- write: Write files");
});

test.each(["grep", "find", "ls"])(
  "omits the shell discovery guideline when %s is available",
  (dedicatedTool) => {
    const prompt = buildPiEngineerPrompt({
      cwd: "/workspace/pi-engineer",
      selectedTools: ["bash", dedicatedTool],
    });

    expect(prompt).not.toContain(shellDiscoveryGuideline);
    expect(prompt).toContain(shellSafetyGuideline);
  },
);

test("omits bash-specific guidelines when bash is unavailable", () => {
  const prompt = buildPiEngineerPrompt({
    cwd: "/workspace/pi-engineer",
    selectedTools: ["read"],
  });

  expect(prompt).not.toContain(shellDiscoveryGuideline);
  expect(prompt).not.toContain(shellSafetyGuideline);
  expect(prompt).not.toContain("Tool guidelines:");
});

test("normalizes exact guideline duplicates while preserving first occurrence order", () => {
  const prompt = buildPiEngineerPrompt({
    cwd: "/workspace/pi-engineer",
    selectedTools: [],
    promptGuidelines: [" First guideline ", "Second guideline", "First guideline", "  "],
  });

  expect(prompt).toContain(`Tool guidelines:
- First guideline
- Second guideline

Pi documentation:`);
});

test("omits empty runtime sections and produces deterministic output", () => {
  const options = {
    cwd: "C:\\workspace",
    selectedTools: [],
    toolSnippets: { bash: "Run commands" },
    promptGuidelines: [" ", "\n"],
    appendSystemPrompt: " \n ",
    contextFiles: [],
    skills: [],
  };
  const first = buildPiEngineerPrompt(options);
  const withoutOptionalSections = buildPiEngineerPrompt({ cwd: options.cwd, selectedTools: [] });

  expect(first).toBe(buildPiEngineerPrompt(options));
  expect(first).toBe(withoutOptionalSections);
  expect(first).not.toContain("Available tools:");
  expect(first).not.toContain("Tool guidelines:");
  expect(first).not.toContain("<project_context>");
  expect(first).not.toContain("<available_skills>");
  expect(first).toContain("Current working directory: C:/workspace");
});
