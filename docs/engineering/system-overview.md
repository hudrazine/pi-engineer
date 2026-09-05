# System Overview

## Current State

`pi-engineer` is a TypeScript Pi Package. Its manifest exposes `src/index.ts` as an Extension and publishes two Package Skills. `src/system-prompt.ts` owns the current Engineering Policy 1.0, the fixed Pi Runtime Adapter, and deterministic Runtime Context assembly.

Engineering Policy 1.0 and the fixed Pi Runtime Adapter are the adopted baseline. Exact hashes identify their bytes, and evaluation campaign fingerprints identify the completed prompt and Harness inputs used for a particular evaluation.

## Components

### Extension entry point

The `before_agent_start` handler returns the completed `pi-engineer` prompt when no explicit custom root prompt is active. When `customPrompt` is present, it leaves that prompt unchanged and emits at most one interactive notification per session.

`/pi-engineer status` reports active or inactive replacement state and the installed Package version.

### Engineering Policy and Pi Runtime Adapter

The Engineering Policy contains seven portable behavior clauses. It does not depend on a model, tool set, project, or operating system.

The fixed Runtime Adapter follows it and defines how project instructions and Skills relate to scope. The Core/Runtime responsibility boundary is documented in [System Prompt Design](system-prompt.md).

### Runtime Context

Runtime Context renders Pi's structured prompt inputs without rediscovering resources. It includes active tool snippets, conditional tool guidance, Pi documentation paths, appended system instructions, project context, Pi-formatted Skills, and the working directory.

### Package Skills

`bounded-implementation` and `subtractive-code-review` load through Pi's normal Skill mechanism. Each is independently usable and owns its task-specific evidence, containment, reuse, defense, verification, and stopping procedure. Pi owns discovery and `Project > User > Package` precedence.

## Prompt Flow

```text
Pi resolves tools and dynamic context
                │
                ▼
       before_agent_start
                │
      customPrompt present? ── yes ──► leave it unchanged
                │ no
                ▼
Engineering Policy + Runtime Adapter + Runtime Context
                │
                ▼
       replacement prompt returned
```

## Evaluation Flow

```text
coordinator initializes one content-addressed campaign
                         │
                         ▼
        non-inference Pi and isolation preflight
                         │
                         ▼
       up to three model workers run in parallel
                         │
                         ▼
 each model executes its nine cases sequentially in fresh sandboxes
                         │
                         ▼
 immutable raw attempts + deterministic checks + human review
```

The Harness loads the real Extension and uses Pi 0.85.0's standard tools. It changes dynamic context only with normal Pi CLI arguments. The Harness is outside the product runtime and does not add an evaluation Extension or tool permission layer.

## External Contracts

The product uses these public Pi capabilities:

- the `before_agent_start` Extension event and `BuildSystemPromptOptions`;
- `formatSkillsForPrompt()`;
- `getReadmePath()`, `getDocsPath()`, and `getExamplesPath()`;
- Package Extension and Skill discovery.

The peer dependency remains open according to Pi Package guidance. Development and evaluation pin Pi 0.85.0. Because Pi 0.85.0's public module currently references the separately published `@earendil-works/pi-server`, development installs the matching 0.85.0 package explicitly; it is not part of the published `pi-engineer` payload.

## Constraints

- Root prompt replacement is order-sensitive with other direct prompt-rewriting Extensions.
- Structured Pi inputs are preserved; arbitrary text mutations from other Extensions are not guaranteed.
- Resource discovery, precedence, and tool schemas remain Pi responsibilities.
- Runtime Context does not claim optional capabilities that are absent.
- Package Skills do not require one another.
- Stable effective inputs produce stable prompt bytes.
- Model behavior is probabilistic and is evaluated without provider-specific prompt variants.

## Decisions

- [ADR-0001: Replace the Root System Prompt in an Extension](decisions/0001-replace-root-system-prompt-in-extension.md)
- [ADR-0002: Separate Portable Policy from Runtime Context](decisions/0002-separate-portable-policy-from-runtime-context.md)
- [ADR-0003: Defer to Explicit Custom System Prompts](decisions/0003-defer-to-explicit-custom-system-prompts.md)
- [ADR-0004: Separate Engineering Policy from Procedural Skills](decisions/0004-separate-engineering-policy-from-procedural-skills.md)
- [ADR-0005: Adopt a Minimal Seven-Clause Core and Runtime Adapter](decisions/0005-adopt-minimal-engineering-policy-and-runtime-adapter.md)
- [ADR-0006: Evaluate the Completed Prompt Through the Real Extension](decisions/0006-evaluate-completed-prompt-through-real-extension.md)
