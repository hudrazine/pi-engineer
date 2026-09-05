import { getDocsPath, getExamplesPath, getReadmePath } from "@earendil-works/pi-coding-agent";
import type { Skill } from "@earendil-works/pi-coding-agent";
import { createHash } from "node:crypto";
import { expect, test } from "vite-plus/test";
import {
  buildPiEngineerPrompt,
  ENGINEERING_POLICY,
  ENGINEERING_POLICY_VERSION,
  PI_RUNTIME_ADAPTER,
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

const currentEngineeringPolicy = {
  version: "1.0",
  sha256: "4a8d68a39b140221d30db0d1f3837d716e3211bf038a98876fc4e0e3315e909c",
  wordCount: 296,
} as const;

const expectedEngineeringPolicy = `You are a software engineering agent working with the user in the current environment. Complete requested work when you can do so safely. When implementation is requested, carry it through instead of stopping at advice or a plan.

Base decisions on available code, files, tool results, and other evidence. Separate observations from assumptions. State uncertainty when it could affect the result.

Match your actions to the user's authorization. Requests to explain, review, or diagnose authorize relevant read-only investigation without changes. Requests to implement or fix authorize the necessary in-scope changes and verification proportionate to risk. Do not expand the task or take external action without a clear request.

Proceed autonomously with safe, relevant work. Apply this distinction when making choices:

- Make minor, reversible choices yourself when they do not materially affect the result.
- Before implementing a choice that could materially affect architecture, dependencies, public interfaces, data, security, cost, deployment, or another important outcome, inspect the applicable context to determine whether the choice is resolved. If it remains unresolved, ask the user before committing to or implementing it.

Permission to perform the task does not decide an unresolved material choice. Ask when the target is ambiguous or permission is required. If blocked, try safe alternatives within scope. Do not bypass access or policy boundaries.

Preserve the user's work. Do not overwrite or revert unrelated changes. Make the smallest coherent change that satisfies the request. Verify it with safe checks proportionate to risk. Report anything that could not be verified.

Before destructive or hard-to-reverse actions, resolve the exact target and confirm that the action is authorized. Prefer reversible methods. Stop when the target or scope is unclear.

Communicate outcomes clearly and concisely. Report material changes, verification, blockers, assumptions, and uncertainty. Do not claim success without evidence.`;

const shellDiscoveryGuideline =
  "Use available shell utilities for repository discovery and prefer efficient tools such as rg when available.";
const shellSafetyGuideline =
  "Do not repurpose standard environment variables for task-local values. Use explicit task-specific paths where safety matters, and avoid interpolation that could execute text or expose sensitive values unintentionally.";

test("keeps the current Engineering Policy bytes stable", () => {
  expect(ENGINEERING_POLICY).toBe(expectedEngineeringPolicy);
  expect({
    version: ENGINEERING_POLICY_VERSION,
    sha256: createHash("sha256").update(ENGINEERING_POLICY).digest("hex"),
    wordCount: ENGINEERING_POLICY.trim().split(/\s+/).length,
  }).toEqual(currentEngineeringPolicy);
});

test("stores the current Engineering Policy in one template literal", () => {
  expect(typeof ENGINEERING_POLICY).toBe("string");
  expect(ENGINEERING_POLICY).toBe(expectedEngineeringPolicy);
});

test("keeps Pi Runtime and engineering procedures outside the Engineering Policy", () => {
  for (const proceduralTerm of [
    PI_RUNTIME_ADAPTER,
    "project instructions",
    "task-specific skills",
    "Available tools:",
    "Current working directory:",
    "Change Envelope",
    "Evidence Gate",
    "DELETE candidate",
    "SIMPLIFY candidate",
    "drift response",
  ]) {
    expect(ENGINEERING_POLICY).not.toContain(proceduralTerm);
  }
});

test("keeps the Pi Runtime Adapter bytes stable", () => {
  expect(PI_RUNTIME_ADAPTER).toBe(
    "Follow applicable project instructions and task-specific skills. Treat them as guidance for performing the requested work, not as authorization to broaden its scope.",
  );
});

test("assembles the Engineering Policy and runtime sections in the current order", () => {
  const prompt = buildPiEngineerPrompt({
    cwd: "C:\\workspace\\pi-engineer",
    selectedTools: ["bash"],
    toolSnippets: { bash: "Run commands" },
    promptGuidelines: ["Keep command output focused"],
    appendSystemPrompt: "Use the repository release process.",
  });

  expect(prompt).toBe(`${ENGINEERING_POLICY}

${PI_RUNTIME_ADAPTER}

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
  expect(first.startsWith(`${ENGINEERING_POLICY}\n\n${PI_RUNTIME_ADAPTER}\n\n`)).toBe(true);
  expect(first).toContain("Current working directory: C:/workspace");
});
