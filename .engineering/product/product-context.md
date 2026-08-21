---
type: product
status: active
---

# Product Context

## Problem

Pi is intentionally small and extensible, but its default system prompt provides only a limited persistent policy for software-engineering judgment. Individual repositories and Skills can add local instructions, yet they are not suitable owners for cross-project behavior such as authorization boundaries, scope discipline, workspace protection, proportional verification, or safe destructive actions.

Copying another coding agent's full prompt would introduce product-specific identities, tools, UI conventions, and operational rules that do not belong in Pi. A useful solution must preserve the mature behavioral lessons without coupling Pi to the source product.

## Product Goal

`pi-engineer` is a Pi Package that replaces Pi's default system prompt with a focused software-engineering agent policy while preserving Pi's minimal, extensible runtime.

The package should give Pi a durable behavioral baseline comparable to mature coding agents without trying to emulate their products, interfaces, or toolsets.

## Goals

- Distinguish answering, reviewing, diagnosing, and implementing so the agent does not infer write authority from a read-only request.
- Balance useful autonomy with explicit authorization and scope boundaries.
- Protect existing files, working-tree changes, project decisions, and external resources as user-owned state.
- Encourage completion of requested implementation work through proportional verification and clear handoff.
- Apply reusable safety rules to destructive operations without making routine engineering work needlessly cautious.
- Use Pi Skills through progressive disclosure without loading unrelated guidance.
- Preserve Pi's additive instructions, project context, active tool guidance, Skills catalog, and environment facts.
- Remain usable across supported model providers and changing optional tool sets.
- Generate stable prompt text from stable runtime inputs to support prompt caching and deterministic tests.

## Product Principles

### Policy over procedure

The persistent prompt defines how the agent makes decisions. A tool, Skill, project instruction, or runtime adapter owns procedures that depend on its specific environment.

### Act within scope

The agent should perform relevant read-only inspection and routine in-scope implementation without unnecessary questions. It must stop before actions that require materially different scope, authority, external effects, or unresolved consequential choices.

### Small portable core

The stable policy must not depend on a model name, a fixed Pi tool set, a particular shell or operating system, a UI renderer, an optional Extension, or an individual repository.

The package provides a model-agnostic behavioral baseline. It does not optimize the shared Portable Core for an individual provider or model, and it does not promise identical probabilistic behavior across Pi's supported models.

### Preserve user ownership

The user's workspace and external resources remain user-owned. The agent must not silently discard, overwrite, revert, delete, or expand them beyond the request.

## Product Constraints

- Version 0.1 supports Pi versions `>=0.84.0`.
- The minimum supported version and the current development version must both be verified before release.
- Behavioral evaluation may be manual, but its result must distinguish passed, partial, failed, and untested scenarios.
- A model-specific evaluation failure may be accepted as a non-blocking known limitation when the common policy is clear, representative models demonstrate the intended behavior, the failure does not expose an unresolved product-wide safety boundary, and further tuning would specialize the Portable Core for that model.

## Required Behavior

The accepted behavior is defined by the [System Prompt Design](../design/system-prompt.md). At minimum, the package must:

- provide the accepted Portable Core;
- assemble the runtime sections in the accepted order;
- preserve supported Pi runtime inputs without semantic rewriting;
- defer to an explicit custom system prompt instead of automatically merging two root policies;
- avoid non-deterministic prompt content;
- expose known compatibility limitations rather than implying universal Extension interoperability.

## Non-goals

Version 0.1 will not:

- reproduce the Codex system prompt verbatim;
- identify the agent as Codex or as a particular model;
- emulate Codex-specific channels, tools, file links, orchestrators, or monitoring features;
- replace repository instructions, Agent Skills, or tool descriptions;
- define framework-specific engineering conventions;
- optimize the Portable Core for individual providers or models, or maintain model-specific prompt variants;
- parse Pi's rendered default prompt or recover arbitrary edits made directly by other Extensions;
- become a general policy framework for non-engineering agents.

## Success Criteria

Version 0.1 is successful when:

- the package loads as a Pi Extension and performs root prompt replacement when eligible;
- the assembled prompt satisfies the invariants in the system-prompt design;
- deterministic unit tests cover assembly, omission, ordering, and conflict behavior;
- the required v0.1 core behavior scenarios have been evaluated and material failures are either corrected or explicitly accepted and documented as non-blocking known limitations;
- installation, usage, custom-prompt precedence, and compatibility limits are documented for users;
- the implementation contains no required dependency on Pi's non-public prompt builder.
