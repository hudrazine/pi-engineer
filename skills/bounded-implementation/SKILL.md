---
name: bounded-implementation
description: "Implement a sufficiently resolved software task in greenfield or existing code while containing unsupported scope, structure, defenses, dependencies, and drift. Use for features, fixes, prototypes, scoped refactoring, migrations, or maintenance when implementation-shape judgment is material. Avoid read-only work, unresolved requirements or architecture, mechanical edits, and post-hoc subtractive review."
---

# Bounded Implementation

Implement the resolved task completely without letting it acquire unsupported behavior, structure, or scope.

Correctness and the current task contract take priority over containment. Preserve applicable contracts, invariants, security controls, required defenses, compatibility, and verified behavior even when they require a larger change.

## Confirm The Invocation Boundary

Use this Skill only when implementation is authorized, the task contract can be established from the request and available context, and meaningful implementation-shape judgment remains.

Do not use it for:

- read-only explanation, diagnosis, or review
- requirements or architecture calibration
- a consequential unresolved choice that determines the solution
- a fully mechanical edit
- a task whose primary goal is post-hoc subtraction or a specialized review

For a large effort, bound the current accepted milestone or work unit. Do not force the entire project into one small envelope.

## Establish The Task Contract

Before editing, determine:

- the observable behavior to add, change, or fix
- existing behavior and contracts that must remain
- explicit constraints, non-goals, and accepted design decisions
- the evidence that can verify the result

Resolve minor, local, reversible choices from repository evidence and normal engineering judgment. If an unresolved interpretation would materially change external behavior, architecture, risk, or the authorized outcome, stop before editing and request the consequential decision.

## Resolve The Implementation Context

For existing software, inspect the target code, nearby tests, relevant callers or dependencies, and semantically similar mechanisms before adding an equivalent. Reuse only when semantics match and reuse does not force unsupported scope.

For greenfield software, inspect the selected runtime, standard library, dependencies, framework mechanisms, accepted design, and delivery constraints. Create only the modules, public surfaces, configuration, and operational mechanisms required by the current contract. The absence of existing code is not evidence for a general framework or extension point.

## Form A Change Envelope

Form a compact, revisable expectation for the current work unit:

- production areas to create or modify
- public APIs and compatibility surfaces
- modules, subsystem boundaries, and abstractions
- dependencies
- configuration, schema, migrations, and deployment effects
- verification

Use counts or LOC only to reveal unexpected growth, never as a target or hard limit. Keep the envelope internal unless the user asks for it or a material deviation needs confirmation. Report material deviations that affect public surfaces, dependencies, data, deployment, or structure.

## Choose The Lowest-Cost Valid Shape

When approaches are semantically equivalent, prefer:

1. an established mechanism with matching semantics
2. the smallest coherent local implementation
3. shared structure justified by concrete current uses or an accepted invariant
4. a dependency or architectural mechanism required by current evidence

This order is a preference, not a constraint. Correctness and accepted repository architecture may justify a later option.

## Apply The Evidence Gate

A new branch, guard, fallback, recovery path, helper, abstraction, dependency, configuration surface, public API, compatibility path, or architectural mechanism needs at least one current justification:

- an explicit requirement or acceptance criterion
- an applicable contract, invariant, or accepted architecture
- a reproduced failure or failing test
- a real trust or security boundary
- concrete current duplication or multiple current uses

Investigate an unclear invariant before adding or removing defensive behavior. Terms such as "production ready," "robust," and "future proof" are not sufficient evidence by themselves.

## Respond To Drift

Reinspect the approach when evidence requires material work outside the envelope. Search for a narrower supported path, then distinguish:

- a justified implementation-plan change, which revises the envelope and continues
- a task-contract or consequential architecture change, which requires user direction before further edits
- incidental cleanup or adjacent improvement, which remains outside the task

More files than expected do not by themselves require clarification. Ask only when new evidence changes a user-owned decision or authorized outcome.

## Verify, Inspect, And Stop

Run the narrowest relevant verification first, then broader checks in proportion to the affected boundary and repository requirements. Do not weaken valid tests to make the implementation pass.

Inspect the task diff before completion. Every meaningful production hunk must implement required behavior, preserve a required contract, fix a demonstrated cause, support necessary verification, or enable another justified hunk. Reconsider unsupported hunks without turning this check into a dedicated subtractive review.

Stop when the task contract is satisfied, verification passes or its limits are explicit, and every remaining production hunk has a task-related justification.

## Optional Semantic Handoff

After a non-trivial verified implementation, a dedicated subtractive review may be useful when the result contains new branches, fallbacks, modules, abstractions, dependencies, configuration, public surfaces, abandoned paths, or material envelope growth.

Hand off only when an available Skill's described responsibility matches that task state. Do not require a particular Skill name or companion, assume another Skill's internal contract, or block completion when none is available. This Skill remains independently complete.
