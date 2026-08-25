---
type: architecture
status: active
---

# System Overview

## Current State

The repository is a TypeScript Pi Package. Its manifest points Pi at `src/index.ts`, which registers the Extension lifecycle and status command. `src/system-prompt.ts` owns the Portable Core and deterministic Runtime Layer assembly.

## Purpose and Boundaries

`pi-engineer` owns replacement of Pi's default root system prompt with an assembled software-engineering prompt. It does not own resource discovery, project-instruction precedence, Skill discovery, tool schemas, or Pi's Extension execution order.

The package integrates through Pi's public Extension API and public helpers. It must not deep-import or copy Pi's non-public `buildSystemPrompt()` implementation.

## Components

### Extension entry point

The entry point registers a `before_agent_start` handler. It decides whether `pi-engineer` is eligible to replace the prompt and returns the assembled prompt when eligible.

If `systemPromptOptions.customPrompt` is present, the entry point preserves that explicit root prompt and does not run root replacement. On the first affected `before_agent_start` event in a session, it emits one short notification when `ctx.hasUI` is true. Later events in the same session remain silent.

The Extension also registers `/pi-engineer status`. The command reports whether replacement is active, why it is inactive when applicable, and the Package and Portable Core versions. Command handlers can inspect the current base prompt options through the public command context.

### Portable Core

The Portable Core is stable behavioral text. It has no knowledge of active tools, paths, project files, Skills, model identity, timestamps, or Extension ordering.

Its accepted content is owned by the [System Prompt Design](../design/system-prompt.md#portable-core-v05).

### Runtime Layer

The Runtime Layer consumes Pi's structured `BuildSystemPromptOptions` and renders dynamic sections without re-discovering resources. It owns conditional tool policy, Pi documentation paths, project-context formatting, Skills formatting, and environment rendering.

### Section assembler

The assembler joins non-empty static and dynamic sections in the accepted order. It must preserve significant input ordering and avoid timestamps, random values, session identifiers, and unstable sorting.

## Interactions and Data Flow

```text
Pi builds the current prompt inputs
               │
               ▼
before_agent_start
  systemPrompt + systemPromptOptions
               │
               ├── customPrompt present ──► preserve explicit root prompt
               │
               ▼
       eligibility confirmed
               │
               ▼
Portable Core + Runtime Layer renderers
               │
               ▼
      ordered section assembly
               │
               ▼
   replacement systemPrompt returned
               │
               ▼
later before_agent_start handlers may modify it
```

## External Contracts

The implementation may rely on these public Pi capabilities:

- `before_agent_start` and its chained `systemPrompt` value;
- `BuildSystemPromptOptions` from the package root;
- `formatSkillsForPrompt()` from the package root;
- `getReadmePath()`, `getDocsPath()`, and `getExamplesPath()` from the package root.

The structured inputs include `customPrompt`, `selectedTools`, `toolSnippets`, `promptGuidelines`, `appendSystemPrompt`, `cwd`, `contextFiles`, and `skills` in the currently installed Pi version.

Pi provides these public APIs at runtime, and the core package is declared as a wildcard peer following Pi Package guidance. Release verification exercises the Pi version resolved from the declared development dependency; the [Product Context](../product/product-context.md#product-constraints) defines the compatibility policy.

## System Constraints

- Root prompt replacement is order-sensitive with other `before_agent_start` handlers. Changes from earlier direct prompt rewriters may be lost; later rewriters may change the `pi-engineer` result.
- `pi-engineer` guarantees preservation only for supported structured inputs, not arbitrary text mutations made by other Extensions.
- The Runtime Layer must preserve Pi-resolved context-file order and must not repeat discovery, precedence, sorting, or deduplication.
- The Skills catalog is emitted only under the same `read`-tool condition used by Pi's custom-prompt behavior.
- Pi documentation guidance is always emitted because an Extension may provide a filesystem capability under a different tool name.
- The same effective inputs must produce byte-for-byte identical output.
- The prompt must not claim that an unavailable optional capability exists.
- In print and JSON modes, `customPrompt` conflict notification is skipped because no UI is available; prompt precedence remains unchanged.

## Decisions

- [ADR-0001: Replace the Root System Prompt in an Extension](../decisions/0001-replace-root-system-prompt-in-extension.md)
- [ADR-0002: Separate Portable Policy from Runtime Context](../decisions/0002-separate-portable-policy-from-runtime-context.md)
- [ADR-0003: Defer to Explicit Custom System Prompts](../decisions/0003-defer-to-explicit-custom-system-prompts.md)

## Implementation Status

Automated prompt-builder and Extension-registration tests verify these boundaries. The scoped manual behavior evaluation is complete, and no blocking known issue remains for the v0.1 release candidate. The completed [Initial Implementation Plan](../plans/archive/initial-implementation.md) and [v0.1 Behavior Evaluation](../plans/archive/v0.1-behavior-evaluation.md) preserve the delivery and evaluation evidence. Package versioning and release publication remain separately authorized operations.
