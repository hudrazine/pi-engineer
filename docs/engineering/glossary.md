# Glossary

## Assembled System Prompt

The complete system prompt produced for one Pi agent run by combining the Engineering Policy, Pi Runtime Adapter, and Runtime Context in the defined order.

- See: [System Prompt Design](system-prompt.md)

## Engineering Policy

The model-independent and tool-independent behavioral policy maintained by `pi-engineer`. Its current 1.0 text is the adopted baseline and may be revised when new evidence warrants it. It defines completion, evidence, authorization, autonomy, preservation, destructive-action, and reporting principles without owning Pi-specific procedures.

- Preferred: Engineering Policy
- Formerly: Portable Core
- Avoid: Codex prompt, Codex clone
- See: [System Prompt Design](system-prompt.md#engineering-policy-v10)

## Pi Runtime Adapter

The fixed sentence placed immediately after the Engineering Policy. It tells the agent to apply project instructions and task-specific Skills without treating them as authority to broaden task scope.

- Preferred: Pi Runtime Adapter
- See: [ADR-0005](decisions/0005-adopt-minimal-engineering-policy-and-runtime-adapter.md)

## Procedural Skill Layer

The on-demand, progressively disclosed engineering procedures supplied by `pi-engineer` separately from the Engineering Policy. The layer contains independently usable implementation-containment and subtractive-review Skills; it does not own repository contracts or deterministic enforcement.

- See: [Engineering Skills Design](engineering-skills.md)
- See: [ADR-0004](decisions/0004-separate-engineering-policy-from-procedural-skills.md)

## Root Prompt Replacement

Replacing Pi's default root system prompt for an agent run, rather than appending instructions to that prompt. `pi-engineer` performs this through the `before_agent_start` Extension event when no explicit custom system prompt is active.

- Preferred: root prompt replacement
- See: [ADR-0001](decisions/0001-replace-root-system-prompt-in-extension.md)

## Runtime Context

The dynamic sections produced from Pi's structured system-prompt inputs and appended after the Pi Runtime Adapter. They preserve Pi-owned runtime information without re-discovering or redefining it.

- Preferred: Runtime Context
- Formerly: Runtime Layer
- Avoid: Pi default prompt copy
- See: [System Overview](system-overview.md)
