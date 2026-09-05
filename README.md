# pi-engineer

`pi-engineer` replaces Pi's default root system prompt with a built-in software-engineering policy and supplies two on-demand engineering Skills.

Inspired by the behavioral principles of mature coding agents like Codex, it brings disciplined engineering judgment to Pi around scope, workspace protection, verification, and safety while keeping your tools, project context, Skills, and additive instructions intact.

## Key Behaviors

- **Scope & authorization**: Inspects and reports for read-only requests without modifying files. For implementation requests, modifies only relevant code and verifies changes autonomously.
- **Ambiguity & judgment**: Resolves minor local details autonomously, but asks before making consequential architectural or scope choices.
- **Engineering minimality**: Preserves correctness, contracts, and required defenses before minimizing unsupported complexity or change surface.
- **Workspace protection**: Respects existing and uncommitted changes. Avoids unsolicited refactoring, cleanup, or destructive commands like `git reset --hard`.
- **Destructive safety**: Resolves the exact target and authorization before destructive work, prefers reversible methods, and stops when the target or scope is unclear.
- **Progressive Skill usage**: Discovers available Agent Skills and loads their instructions only when needed.
- **Ecosystem preservation**: Seamlessly preserves your tools, project instructions (`AGENTS.md`), custom additions (`APPEND_SYSTEM.md`), and working directory.

## Bundled Skills

- **`bounded-implementation`**: Contains unsupported scope, structure, dependencies, defenses, and drift while implementing a sufficiently resolved task in new or existing software.
- **`subtractive-code-review`**: Reviews a completed task diff or bounded existing code area for evidence-backed deletion or simplification without removing required behavior or defenses.

Each Skill works independently and loads through Pi's normal progressive disclosure. A completed non-trivial implementation may optionally hand off to subtractive review, but neither Skill requires the other.

## Installation

```text
pi install npm:@hudrazine/pi-engineer
```

Or install directly from GitHub:

```text
pi install git:github.com/hudrazine/pi-engineer
```

## Usage

Once installed, `pi-engineer` automatically replaces Pi's root prompt for eligible agent sessions.

Inspect status at any time:

```text
/pi-engineer status
```

This reports whether prompt replacement is active, why it is inactive (if applicable), and the installed version.

### Enable and Disable

Disable `pi-engineer` without uninstalling it with `pi config`:

- **Globally**: run `pi config` and toggle off the extension of `@hudrazine/pi-engineer`.
- **Project only**: run `pi config -l` instead to edit `.pi/settings.json`.

Toggle it back on the same way. Changes take effect the next time Pi starts; while disabled, `/pi-engineer status` is unavailable too.

## Customization and Precedence

- **Additive instructions**: `APPEND_SYSTEM.md`, project instructions (`AGENTS.md`), and Skills are preserved and appended as usual.
- **Explicit root prompts**: If a custom root prompt is set (via `SYSTEM.md`, `--system-prompt`, or a custom template), `pi-engineer` steps aside and disables itself for that run, notifying you once in interactive sessions.
- **Skill overrides**: Same-name Skills resolve through Pi's `Project > User > Package` precedence, so a project or user Skill can replace either bundled default.

## Compatibility and Limitations

- A recent Pi release is recommended. Older releases are not tested or guaranteed.
- Built entirely on Pi's public Extension APIs and prompt helpers.
- If another extension directly rewrites the system prompt, extension execution order determines the final result.
- The policy and Skills are model-agnostic. Skill selection remains probabilistic, so individual models may occasionally miss a matching Skill, load an adjacent Skill unnecessarily, or omit an optional review handoff. The built-in policy still supplies the universal correctness and scope baseline when a Skill is not selected.

## License

MIT
