import {
  formatSkillsForPrompt,
  getDocsPath,
  getExamplesPath,
  getReadmePath,
  type BuildSystemPromptOptions,
} from "@earendil-works/pi-coding-agent";

export const ENGINEERING_POLICY_VERSION = "1.0";

export const ENGINEERING_POLICY = `You are a software engineering agent working with the user in the current environment. Complete requested work when you can do so safely. When implementation is requested, carry it through instead of stopping at advice or a plan.

Base decisions on available code, files, tool results, and other evidence. Separate observations from assumptions. State uncertainty when it could affect the result.

Match your actions to the user's authorization. Requests to explain, review, or diagnose authorize relevant read-only investigation without changes. Requests to implement or fix authorize the necessary in-scope changes and verification proportionate to risk. Do not expand the task or take external action without a clear request.

Proceed autonomously with safe, relevant work. Apply this distinction when making choices:

- Make minor, reversible choices yourself when they do not materially affect the result.
- Before implementing a choice that could materially affect architecture, dependencies, public interfaces, data, security, cost, deployment, or another important outcome, inspect the applicable context to determine whether the choice is resolved. If it remains unresolved, ask the user before committing to or implementing it.

Permission to perform the task does not decide an unresolved material choice. Ask when the target is ambiguous or permission is required. If blocked, try safe alternatives within scope. Do not bypass access or policy boundaries.

Preserve the user's work. Do not overwrite or revert unrelated changes. Make the smallest coherent change that satisfies the request. Verify it with safe checks proportionate to risk. Report anything that could not be verified.

Before destructive or hard-to-reverse actions, resolve the exact target and confirm that the action is authorized. Prefer reversible methods. Stop when the target or scope is unclear.

Communicate outcomes clearly and concisely. Report material changes, verification, blockers, assumptions, and uncertainty. Do not claim success without evidence.`;

export const PI_RUNTIME_ADAPTER =
  "Follow applicable project instructions and task-specific skills. Treat them as guidance for performing the requested work, not as authorization to broaden its scope.";

const DEFAULT_TOOLS = ["read", "bash", "edit", "write"];

function getSelectedTools(options: BuildSystemPromptOptions): string[] {
  return options.selectedTools ?? DEFAULT_TOOLS;
}

function renderAvailableTools(
  options: BuildSystemPromptOptions,
  selectedTools: string[],
): string | undefined {
  const tools = selectedTools.flatMap((name) => {
    const snippet = options.toolSnippets?.[name];
    return snippet ? [`- ${name}: ${snippet}`] : [];
  });

  return tools.length > 0 ? `Available tools:\n${tools.join("\n")}` : undefined;
}

function renderToolGuidelines(
  options: BuildSystemPromptOptions,
  selectedTools: string[],
): string | undefined {
  const guidelines: string[] = [];
  const seen = new Set<string>();
  const add = (guideline: string) => {
    const normalized = guideline.trim();
    if (normalized.length === 0 || seen.has(normalized)) return;
    seen.add(normalized);
    guidelines.push(normalized);
  };

  const hasBash = selectedTools.includes("bash");
  if (
    hasBash &&
    !selectedTools.includes("grep") &&
    !selectedTools.includes("find") &&
    !selectedTools.includes("ls")
  ) {
    add(
      "Use available shell utilities for repository discovery and prefer efficient tools such as rg when available.",
    );
  }
  if (hasBash) {
    add(
      "Do not repurpose standard environment variables for task-local values. Use explicit task-specific paths where safety matters, and avoid interpolation that could execute text or expose sensitive values unintentionally.",
    );
  }
  for (const guideline of options.promptGuidelines ?? []) add(guideline);

  return guidelines.length > 0
    ? `Tool guidelines:\n${guidelines.map((guideline) => `- ${guideline}`).join("\n")}`
    : undefined;
}

function renderPiDocumentation(): string {
  return `Pi documentation:
- README: ${getReadmePath()}
- Documentation: ${getDocsPath()}
- Examples: ${getExamplesPath()}
Before making Pi-specific implementation decisions, consult relevant installed Markdown documentation and follow its references.`;
}

function renderProjectContext(options: BuildSystemPromptOptions): string | undefined {
  if (!options.contextFiles || options.contextFiles.length === 0) return undefined;

  const files = options.contextFiles.map(
    ({ path, content }) => `<project_instructions path="${path}">
${content}
</project_instructions>`,
  );
  return `<project_context>

Project-specific instructions and guidelines:

${files.join("\n\n")}

</project_context>`;
}

function renderSkills(
  options: BuildSystemPromptOptions,
  selectedTools: string[],
): string | undefined {
  if (!selectedTools.includes("read")) return undefined;

  const formattedSkills = formatSkillsForPrompt(options.skills ?? []).trim();
  return formattedSkills.length > 0 ? formattedSkills : undefined;
}

function isNonEmptySection(section: string | undefined): section is string {
  return section !== undefined && section.trim().length > 0;
}

export function buildPiEngineerPrompt(options: BuildSystemPromptOptions): string {
  const selectedTools = getSelectedTools(options);
  const sections = [
    ENGINEERING_POLICY,
    PI_RUNTIME_ADAPTER,
    renderAvailableTools(options, selectedTools),
    renderToolGuidelines(options, selectedTools),
    renderPiDocumentation(),
    options.appendSystemPrompt,
    renderProjectContext(options),
    renderSkills(options, selectedTools),
    `Current working directory: ${options.cwd.replaceAll("\\", "/")}`,
  ];

  return sections.filter(isNonEmptySection).join("\n\n");
}
