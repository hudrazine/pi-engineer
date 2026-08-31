# Product Context

## Problem

Pi is intentionally small and extensible, but its default system prompt provides only a limited persistent policy for software-engineering judgment. Repository instructions can define local contracts and Skills can provide on-demand procedures, but neither should be expanded into a competing universal root policy.

Cross-project behavior such as authorization boundaries, scope discipline, workspace protection, proportional verification, and safe destructive actions needs a persistent baseline. Recurring implementation-containment and subtractive-review procedures need a focused reusable layer that can load only when the task matches.

Copying another coding agent's full prompt would introduce product-specific identities, tools, UI conventions, and operational rules that do not belong in Pi. A useful solution must preserve the mature behavioral lessons without coupling Pi to the source product.

## Product Goal

`pi-engineer` is a Pi Package that replaces Pi's default system prompt with a focused software-engineering agent policy and supplies optional on-demand engineering Skills while preserving Pi's minimal, extensible runtime.

The package should give Pi a durable behavioral baseline and reusable generic procedures comparable to mature coding agents without trying to emulate their products, interfaces, or toolsets.

## Goals

- Distinguish answering, reviewing, diagnosing, and implementing so the agent does not infer write authority from a read-only request.
- Balance useful autonomy with explicit authorization and scope boundaries.
- Protect existing files, working-tree changes, project decisions, and external resources as user-owned state.
- Encourage completion of requested implementation work through proportional verification and clear handoff.
- Apply reusable safety rules to destructive operations without making routine engineering work needlessly cautious.
- State a universal priority that preserves correctness, contracts, invariants, security, required defenses, and established mechanisms before minimizing unsupported complexity.
- Provide `bounded-implementation` for implementation containment in new and existing software.
- Provide `subtractive-code-review` for evidence-backed simplification of completed task diffs and bounded existing code areas.
- Use Pi Skills through progressive disclosure without loading unrelated guidance.
- Preserve Pi's additive instructions, project context, active tool guidance, Skills catalog, and environment facts.
- Remain usable across supported model providers and changing optional tool sets.
- Generate stable prompt text from stable runtime inputs to support prompt caching and deterministic tests.

## Product Principles

### Policy over procedure

The persistent prompt defines how the agent makes decisions. A tool, Skill, project instruction, or runtime adapter owns procedures that depend on its specific environment.

### Act within scope

The agent should perform relevant read-only inspection and routine in-scope implementation without unnecessary questions. It must stop before actions that require materially different scope, authority, external effects, or unresolved consequential choices.

### Small, portable policy

The stable policy must not depend on a model name, a fixed Pi tool set, a particular shell or operating system, a UI renderer, an optional Extension, or an individual repository.

The package provides a model-agnostic behavioral baseline. It does not optimize the shared Engineering Policy for an individual provider or model, and it does not promise identical probabilistic behavior across Pi's supported models.

### Progressive procedural depth

Detailed localization, Change Envelope, Evidence Gate, drift response, candidate classification, and subtractive verification procedures belong in independently usable Skills. They must not become persistent root-prompt procedure merely to guarantee that every task sees them.

Package Skills are defaults rather than mandatory implementations. Project and user Skills may replace them through Pi's normal precedence.

### Preserve user ownership

The user's workspace and external resources remain user-owned. The agent must not silently discard, overwrite, revert, delete, or expand them beyond the request.

## Product Constraints

- Pi-provided core packages use wildcard peer ranges following Pi Package guidance. A recent Pi release is recommended; older releases are not tested or guaranteed.
- The Pi version resolved from the declared development dependency must be verified before release.
- Behavioral evaluation may be manual, but its result must distinguish passed, partial, failed, and untested scenarios.
- A model-specific evaluation failure may be accepted as a non-blocking known limitation when the common policy or Skill contract is clear, representative models demonstrate the intended behavior, the failure does not expose an unresolved product-wide safety or correctness boundary, and further tuning would specialize shared guidance for that model.

## Required Behavior

The accepted behavior is defined by the [System Prompt Design](system-prompt.md) and [Engineering Skills Design](engineering-skills.md). At minimum, the package must:

- provide the accepted Engineering Policy;
- assemble the runtime sections in the accepted order;
- preserve supported Pi runtime inputs without semantic rewriting;
- defer to an explicit custom system prompt instead of automatically merging two root policies;
- avoid non-deterministic prompt content;
- expose `bounded-implementation` and `subtractive-code-review` as independently usable Package Skills;
- preserve Pi's `Project > User > Package` resolution when names collide;
- keep procedural Skill behavior separate from the universal Engineering Policy;
- expose known compatibility limitations rather than implying universal Extension interoperability.

## Non-goals

The package will not:

- reproduce the Codex system prompt verbatim;
- identify the agent as Codex or as a particular model;
- emulate Codex-specific channels, tools, file links, orchestrators, or monitoring features;
- override repository instructions, project or user Skills, or tool descriptions;
- create or enforce repository-specific requirements, architecture, test strategy, lint rules, CI, or fixed code-size limits;
- define framework-specific engineering conventions;
- optimize the Engineering Policy for individual providers or models, or maintain model-specific prompt variants;
- parse Pi's rendered default prompt or recover arbitrary edits made directly by other Extensions;
- become a general policy framework for non-engineering agents.

## Success Criteria

The product is successful when:

- the package loads as a Pi Extension and performs root prompt replacement when eligible;
- the assembled prompt satisfies the invariants in the system-prompt design;
- deterministic unit tests cover assembly, omission, ordering, and conflict behavior;
- the required Policy and Skill behavior scenarios have been evaluated and material failures are either corrected or explicitly accepted and documented as non-blocking known limitations;
- the Package Skills are discoverable, independently usable, and replaceable by project or user Skills;
- required correctness, preservation, safety, authorization, and verification gates take priority over reduction metrics;
- installation, usage, custom-prompt precedence, and compatibility limits are documented for users;
- the implementation contains no required dependency on Pi's non-public prompt builder.
