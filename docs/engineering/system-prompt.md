# System Prompt Design

## Purpose

This document defines the prompt produced by `pi-engineer`. Engineering Policy 1.0 and the fixed Pi Runtime Adapter are the adopted baseline. Future evidence may justify a revision, but changes must be deliberate and identified by exact hashes and evaluation campaign fingerprints.

## Responsibilities

The prompt has two stable parts and one dynamic part:

1. The Engineering Policy defines portable engineering behavior.
2. The Pi Runtime Adapter connects project instructions and Skills to that behavior without granting wider authority.
3. Runtime Context renders the tools, guidance, documents, project instructions, Skills, and working directory resolved by Pi.

Project instructions own repository-specific requirements and decisions. Skills own task-specific procedures. Tool schemas and Pi own tool behavior. The Engineering Policy does not duplicate those responsibilities.

## Assembly Order

`buildPiEngineerPrompt()` joins non-empty sections in this order:

```text
Engineering Policy 1.0
Pi Runtime Adapter
Available tools
Tool guidelines
Pi documentation
appendSystemPrompt
project context
formatted Skills
current working directory
```

Stable effective inputs must produce byte-for-byte identical output. The assembler preserves Pi-provided ordering and does not add timestamps, session identifiers, model names, or random values.

## Engineering Policy 1.0

The `ENGINEERING_POLICY` template literal in [`src/system-prompt.ts`](../../src/system-prompt.ts) is the sole exact-text authority. It currently contains seven clauses covering completion, evidence, authorization, autonomy and material choices, preservation and verification, destructive actions, and reporting.

The current exact SHA-256 is `4a8d68a39b140221d30db0d1f3837d716e3211bf038a98876fc4e0e3315e909c`. Automated tests protect its text, whitespace, version, and hash. The policy begins with a natural role sentence and uses a flat two-item list only for the minor-choice and material-choice distinction in clause 4.

The policy is model-independent in wording and direction. It does not promise identical behavior across models and is not tuned to a provider, a specific evaluation case, Pi tools, or an optional Extension.

## Pi Runtime Adapter

`PI_RUNTIME_ADAPTER` follows the Engineering Policy as a separate fixed sentence. Its exact SHA-256 is `3f1ac373e2d76551d855f729899afe3d4b66437f236afc585943d060f2598316`.

The Adapter tells the model to follow applicable project instructions and task-specific Skills as guidance for the requested work, not as authority to expand the task. It does not discover resources or define their precedence.

## Runtime Inputs

| Pi input             | Treatment                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `customPrompt`       | Disable `pi-engineer` root replacement instead of merging independent root prompts.                  |
| `selectedTools`      | Determine active tool snippets, conditional tool guidance, and whether the Skills catalog is usable. |
| `toolSnippets`       | Render snippets for selected tools only. Omit the section when none are present.                     |
| `promptGuidelines`   | Trim, remove empty values, and remove exact duplicates while preserving first occurrence order.      |
| `appendSystemPrompt` | Insert as bare additive content.                                                                     |
| `contextFiles`       | Render in Pi-provided order with Pi-compatible project-context markup.                               |
| `skills`             | Format through Pi's public `formatSkillsForPrompt()` helper when `read` is active.                   |
| `cwd`                | Normalize separators and render last.                                                                |

The prompt always provides compact paths to Pi's installed README, documentation, and examples through public Pi helpers. When `bash` is active, it adds only tool-set-dependent discovery and shell-safety guidance.

## Explicit Custom Prompts

When `customPrompt` is present, the Extension leaves it active. In an interactive session, the first affected agent run emits one concise notification. `/pi-engineer status` reports whether replacement is active and the installed Package version without exposing prompt or project content.

## Invariants and Limits

- Empty optional sections are omitted.
- The Runtime Context does not rediscover or reorder Pi resources.
- Project and user Skills may replace same-name Package Skills through Pi's precedence.
- `pi-engineer` preserves structured Pi inputs but cannot preserve arbitrary prompt rewrites made directly by another Extension.
- `before_agent_start` order remains observable when multiple Extensions rewrite the prompt.
- Prompt behavior is probabilistic. A single-model failure does not automatically justify changing the shared policy.

The completed-prompt evaluation contract is defined in [System Prompt Evaluation](evaluation.md). The evidence supporting the current adoption is recorded in [System Prompt Adoption Evaluation](evaluations/2026-09-05-system-prompt-adoption.md).
