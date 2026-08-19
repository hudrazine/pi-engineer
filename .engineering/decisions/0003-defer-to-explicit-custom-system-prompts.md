---
type: adr
status: accepted
---

# ADR-0003: Defer to Explicit Custom System Prompts

## Context

Pi supports explicit custom root prompts through `SYSTEM.md`, command-line configuration, and custom templates. `pi-engineer` also supplies a root prompt. Automatically combining two independently authored root policies can create contradictory identities, instruction hierarchies, and behavior.

## Decision Drivers

- Explicit user configuration must remain authoritative.
- Two root policies cannot be merged safely by syntax alone.
- Users need predictable mechanisms for adding instructions without replacing the root.
- The package should preserve Pi's existing distinction between replacement and additive configuration.

## Options Considered

### Always replace the explicit prompt

This would make `pi-engineer` behavior consistent but would silently ignore deliberate user configuration.

### Automatically merge both root prompts

This would retain both texts but could create unresolved semantic conflicts and an unclear instruction hierarchy.

### Let the explicit custom prompt win

This preserves user intent and directs additive customization to Pi's existing append, project-context, and Skill mechanisms.

## Decision

When `systemPromptOptions.customPrompt` is present, `pi-engineer` does not replace or automatically merge the root prompt.

Users who want `pi-engineer` plus additional instructions should use `APPEND_SYSTEM.md`, project instructions, or Skills as appropriate.

## Rationale

An explicit root prompt is a deliberate replacement request. Deferring to it preserves Pi's configuration semantics and avoids pretending that arbitrary policies can be merged safely.

## Consequences

- `pi-engineer` may be installed but inactive for a run with an explicit custom prompt.
- The first affected `before_agent_start` event emits one short notification per session when a UI is available.
- `/pi-engineer status` provides explicit state inspection without requiring repeated automatic notification.
- Print and JSON modes skip the notification because no UI is available; precedence behavior remains the same.
- User documentation must distinguish root replacement from additive customization.
