---
type: adr
status: accepted
---

# ADR-0004: Separate Engineering Policy from Procedural Skills

## Context

The Portable Core already defines cross-project scope discipline, preservation, autonomy, and proportional verification. Those persistent principles are necessary, but instructions such as "keep changes minimal" do not by themselves give an agent a reliable method for localizing a change, justifying new structure, detecting implementation drift, or performing an independent subtractive review.

Putting the entire method in the root prompt would make the Portable Core larger, mix policy with task-specific procedure, and repeat responsibilities better loaded through Pi's progressive Skill discovery. A single end-to-end Skill would reduce prompt growth but would combine two different optimization problems: constructing the required implementation and removing unsupported code from an implementation or an existing code area.

## Decision Drivers

- Correctness, repository contracts, invariants, security controls, and required robustness must take priority over reducing code or diff size.
- Universal judgment should remain available when a Skill is disabled, overridden, not selected, or cannot be read.
- Procedural guidance should load only for a recognizable task class.
- New and existing software development should use the same durable principles without assuming a language, framework, repository layout, or fixed tool set.
- Implementation containment and subtractive review need separate triggers, evidence, permissions, and completion conditions.
- Project and user Skills must remain able to replace Package defaults through Pi's normal `Project > User > Package` precedence.
- Repository instructions, design decisions, and mechanical quality gates must remain owned by their repositories and users.

## Options Considered

### Expand the Portable Core with the complete workflow

This would make the procedure persistent, but it would increase prompt size, apply irrelevant steps to many tasks, and violate the accepted policy-over-procedure boundary.

### Add one mandatory implementation-and-review Skill

This would keep procedure out of the root prompt, but it would join construction and subtraction into one broad task class. It would also make review of pre-existing code less independently reusable.

### Keep concise policy and add two independent procedural Skills

This preserves a small universal baseline while giving implementation and subtraction separate invocation and evidence contracts. The Skills can cooperate by task state without requiring each other by name or availability.

## Decision

Keep the Portable Core responsible for concise, model-independent judgment:

1. correctness comes before reducing code or change size;
2. existing contracts, invariants, security, and required defenses remain protected;
3. equivalent valid approaches should reuse established mechanisms;
4. unsupported complexity and change surface should not be introduced;
5. work should stop after the required behavior is implemented and proportionately verified.

Keep localization, Change Envelopes, Evidence Gates, drift response, candidate classification, and subtractive verification out of the Portable Core.

Bundle two on-demand Skills:

- `bounded-implementation` owns implementing a sufficiently resolved task in new or existing software without unsupported scope or structure;
- `subtractive-code-review` owns evidence-backed deletion or simplification in a completed task diff or a bounded existing code area.

Each Skill must complete independently. `bounded-implementation` may hand a verified non-trivial result to any available Skill whose described responsibility clearly matches dedicated subtractive review, but it must not require a particular Skill name or block completion when no such Skill is available. `subtractive-code-review` must not assume that `bounded-implementation` produced its input.

Use Pi's normal Skill precedence without collision avoidance or Package-specific namespacing. Do not make the Package Skills owners of repository instructions, requirements, architecture, test configuration, lint rules, CI, or other deterministic enforcement.

## Rationale

The selected design keeps universal tradeoff rules continuously available while using progressive disclosure for procedures that require focused model attention. Separate Skills match the materially different task states and risks: implementation decides what must be added or changed, while subtractive review decides what can safely be removed. Standalone completion preserves composability with project and user overrides; a semantic, optional handoff still supports a focused two-stage workflow for non-trivial changes.

## Consequences

- The Product Context expands from a prompt-only package goal to a portable policy plus two optional generic engineering procedures.
- The exact Portable Core revision remains subject to staged behavior evaluation before acceptance.
- A dedicated Skill design owns invocation, boundaries, evidence, failure handling, and completion behavior.
- Package integration must expose the two Skills without changing Pi's discovery or precedence semantics.
- Behavior evaluation must isolate the current Core, revised Core, each Skill, and optional cooperation rather than attributing the combined outcome to one mechanism.
- The Skills add maintenance and evaluation cost, but their instructions remain independently replaceable and on demand.
