---
type: adr
status: accepted
---

# ADR-0001: Replace the Root System Prompt in an Extension

## Context

`pi-engineer` must provide a coherent behavioral baseline that differs materially from Pi's default system prompt while continuing to receive Pi-resolved runtime inputs. Users also need to install and distribute it as a Pi Package.

## Decision Drivers

- The behavioral policy must be active without requiring every project to copy a prompt file.
- The package must adapt to current tools, context files, Skills, and additive user instructions.
- The integration must use Pi's supported public Extension contract.
- The result must be distributable as a Pi Package.

## Options Considered

### Distribute a `SYSTEM.md`

This would use Pi's file-based replacement mechanism, but it would be primarily static and would not provide a package-owned runtime adapter for structured prompt inputs.

### Append policy to Pi's default prompt

This would preserve the default prompt automatically, but it would retain policy overlap, increase prompt size, and weaken control over the behavioral baseline.

### Replace the prompt in `before_agent_start`

This allows the Package to use Pi's structured prompt inputs and return a complete prompt for the current run. It also makes Extension ordering observable.

## Decision

Implement `pi-engineer` as a Pi Extension that performs root prompt replacement through `before_agent_start` when no explicit custom root prompt is active.

## Rationale

The Extension event provides the structured inputs needed to preserve Pi's runtime context without copying or parsing the rendered default prompt. It is the only considered option that combines package distribution, a coherent root policy, and runtime adaptation.

## Consequences

- The package must reconstruct supported additive sections from `systemPromptOptions`.
- Direct system-prompt rewriting by other Extensions is order-sensitive and cannot be made fully transparent.
- Installation and user-facing compatibility documentation must explain that `pi-engineer` is a root replacement, not a simple append.
- The implementation must not depend on Pi's non-public `buildSystemPrompt()` export.
