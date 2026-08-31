# Glossary

## Assembled System Prompt

The complete system prompt produced for one Pi agent run by combining the Portable Core with the Runtime Layer output in the defined order.

- See: [System Prompt Design](design/system-prompt.md)

## Portable Core

The stable, model-independent and tool-independent behavioral policy maintained by `pi-engineer`. It defines how the agent communicates, interprets authorization, works in a user-owned workspace, verifies changes, handles destructive actions, and uses Skills.

- Preferred: Portable Core
- Avoid: Codex prompt, Codex clone
- See: [System Prompt Design](design/system-prompt.md#portable-core-v06)

## Procedural Skill Layer

The on-demand, progressively disclosed engineering procedures supplied by `pi-engineer` separately from the Portable Core. The accepted layer contains independently usable implementation-containment and subtractive-review Skills; it does not own repository contracts or deterministic enforcement.

- See: [Engineering Skills Design](design/engineering-skills.md)
- See: [ADR-0004](decisions/0004-separate-engineering-policy-from-procedural-skills.md)

## Root Prompt Replacement

Replacing Pi's default root system prompt for an agent run, rather than appending instructions to that prompt. `pi-engineer` performs this through the `before_agent_start` Extension event when no explicit custom system prompt is active.

- Preferred: root prompt replacement
- See: [ADR-0001](decisions/0001-replace-root-system-prompt-in-extension.md)

## Runtime Layer

The adapter that converts Pi's structured system-prompt inputs into the dynamic sections appended after the Portable Core. It preserves Pi-owned runtime information without re-discovering or redefining it.

- Preferred: Runtime Layer
- Avoid: Pi default prompt copy
- See: [System Overview](architecture/system-overview.md)
