# pi-engineer

`pi-engineer` is a Pi Package that replaces Pi's default root system prompt with a portable software-engineering policy. Inspired by the behavioral principles of mature coding agents like Codex, it gives Pi disciplined engineering judgment—such as authorization boundaries, scope discipline, workspace protection, proportional verification, and safety rules for destructive actions—while preserving Pi's tools, project context, Skills, and additive instructions.

## Key Behaviors

`pi-engineer` applies a consistent engineering policy across models:

- **Scope and authorization**: Distinguishes reviewing, diagnosing, and implementing. Read-only requests inspect and report without modifying files. Implementation requests diagnose, modify only relevant code, and verify changes autonomously.
- **Ambiguity and judgment**: Resolves minor, local details autonomously, but stops and requests direction before making consequential architectural or scope choices.
- **Workspace and state protection**: Treats the workspace as user-owned state. Preserves unrelated uncommitted changes and avoids unsolicited refactoring, cleanup, or destructive operations like unauthorized `git reset --hard`.
- **Safety on destructive actions**: Treats repository roots, home directories, and filesystem roots as protected roots. Stops before recursive deletion of protected roots even if explicitly requested, requiring narrow, explicit targets.
- **Progressive Skill usage**: Discovers and follows available Agent Skills through progressive disclosure, reading skill instructions only when relevant.
- **Pi ecosystem preservation**: Preserves active tool snippets, project context (`AGENTS.md`, `CLAUDE.md`), additive instructions (`APPEND_SYSTEM.md`), and the working directory in their standard assembly order.

## Requirements

Pi `>=0.84.0`.

## Installation

Install the package using Pi:

```text
pi install npm:@hudrazine/pi-engineer
```

Or install directly from GitHub:

```text
pi install git:github.com/hudrazine/pi-engineer
```

## Usage

Once installed, `pi-engineer` automatically replaces Pi's root prompt for eligible agent sessions.

Inspect the current status at any time with:

```text
/pi-engineer status
```

The command reports whether replacement is active, why it is inactive (if applicable), and the installed Package and Portable Core versions.

## Customization and Precedence

- **Additive instructions**: Pi's `APPEND_SYSTEM.md`, project instructions (`AGENTS.md`, `CLAUDE.md`), and Skills work normally and are preserved in the assembled prompt.
- **Custom root prompts**: An explicit custom root prompt—configured through `SYSTEM.md`, the `--system-prompt` flag, or a custom prompt template—takes precedence. When a custom root prompt is active, `pi-engineer` steps aside and does not replace or merge it. In interactive UI sessions, it displays a one-time notification on the first affected run.

## Compatibility and Limitations

- `pi-engineer` uses only Pi's public Extension API and prompt helpers.
- If another Extension directly rewrites the system prompt in `before_agent_start`, Extension execution order determines the final output. `pi-engineer` preserves Pi's structured prompt inputs, but cannot restore prompt text altered directly by other extensions.
- The policy is model-agnostic and provides a durable behavioral baseline. It does not contain model-specific workarounds, and individual models may still exhibit minor probabilistic variations in edge cases.

## License

MIT
