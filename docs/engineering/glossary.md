# Glossary

## Assembled System Prompt

The complete system prompt produced for one Pi agent run by combining the Engineering Policy with the Runtime Context in the defined order.

- See: [System Prompt Design](system-prompt.md)

## Engineering Policy

The stable, model-independent and tool-independent behavioral policy maintained by `pi-engineer`. It defines how the agent communicates, interprets authorization, works in a user-owned workspace, verifies changes, handles destructive actions, and uses Skills.

- Preferred: Engineering Policy
- Formerly: Portable Core
- Avoid: Codex prompt, Codex clone
- See: [System Prompt Design](system-prompt.md#engineering-policy-v06)

## Procedural Skill Layer

The on-demand, progressively disclosed engineering procedures supplied by `pi-engineer` separately from the Engineering Policy. The accepted layer contains independently usable implementation-containment and subtractive-review Skills; it does not own repository contracts or deterministic enforcement.

- See: [Engineering Skills Design](engineering-skills.md)
- See: [ADR-0004](decisions/0004-separate-engineering-policy-from-procedural-skills.md)

## Root Prompt Replacement

Replacing Pi's default root system prompt for an agent run, rather than appending instructions to that prompt. `pi-engineer` performs this through the `before_agent_start` Extension event when no explicit custom system prompt is active.

- Preferred: root prompt replacement
- See: [ADR-0001](decisions/0001-replace-root-system-prompt-in-extension.md)

## Runtime Context

The dynamic sections produced from Pi's structured system-prompt inputs and appended after the Engineering Policy. They preserve Pi-owned runtime information without re-discovering or redefining it.

- Preferred: Runtime Context
- Formerly: Runtime Layer
- Avoid: Pi default prompt copy
- See: [System Overview](system-overview.md)
