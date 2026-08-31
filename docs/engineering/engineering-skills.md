# Engineering Skills Design

## Purpose And Implementation Status

This document is the authoritative behavioral design for the two generic engineering Skills accepted by [ADR-0004](decisions/0004-separate-engineering-policy-from-procedural-skills.md). It defines their task classes, boundaries, evidence, interaction, failure handling, and evaluation contract.

The Package implements and publishes both accepted Skills through its Pi and npm manifests. Deterministic tests verify native Skill loading, required behavioral boundaries, packaged contents, isolated local-Package discovery under Pi 0.84.2, `Project > User > Package` replacement, and preservation of Pi's resolved result at prompt assembly. Staged conditions C through E passed every behavioral required gate. The final disposition accepts the Skills without further changes and records the remaining non-blocking selection and cooperation limitations in the [Engineering Minimality Behavior Evaluation](plans/archive/engineering-minimality-evaluation.md#final-behavior-disposition).

## Responsibility Model

| Owner                      | Responsibility                                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| Engineering Policy         | Universal correctness, preservation, reuse, justified-complexity, verification, and stopping principles |
| `bounded-implementation`   | Construct the required implementation while containing unsupported scope and structure                  |
| `subtractive-code-review`  | Find and, when authorized, apply evidence-backed deletion or simplification                             |
| Repository instructions    | Local architecture, conventions, commands, prohibitions, and precedence                                 |
| Design documents and tasks | Requirements, non-goals, constraints, accepted decisions, and acceptance criteria                       |
| Tests, lint, typecheck, CI | Deterministic correctness, regression, policy, and quality enforcement                                  |

The Skills consume relevant repository-owned context and checks when available. They do not create a universal repository contract, require a documentation layout, prescribe fixed commands, or replace deterministic enforcement.

## Shared Decision Priority

Both Skills apply the Engineering Policy's priority order without restating its full policy:

1. satisfy the current requirement correctly;
2. preserve applicable contracts, invariants, security controls, required defenses, and verified behavior;
3. reuse semantically matching mechanisms and follow repository decisions;
4. minimize only unsupported change surface, structure, and concepts.

Code size, changed-file count, and production LOC are diagnostic signals, not optimization targets. A smaller result is invalid when it loses required behavior, protection, compatibility, verification, or architectural coherence.

## `bounded-implementation`

### Task Class And Failure Modes

Use this Skill to implement a sufficiently resolved software task when model judgment could introduce speculative structure, duplicated capability, defensive branches without evidence, or unplanned scope. It applies to greenfield and existing development, including features, fixes, prototypes, scoped refactoring, scoped migration, and maintenance.

The baseline failures it is intended to reduce are:

- editing before locating the requirement, root cause, relevant symbols, or equivalent behavior;
- creating a parallel helper, wrapper, dependency, configuration surface, or abstraction instead of using an applicable mechanism;
- treating hypothetical future variation as a current requirement;
- adding guards, fallbacks, or recovery behavior for states excluded by an established invariant;
- allowing implementation discoveries to silently change the task contract;
- continuing adjacent cleanup or improvement after the required outcome is verified.

### Invocation Boundary

Invoke when writing or changing software is authorized, the task contract can be established from the request and available context, and implementation judgment is material.

Do not invoke for:

- read-only explanation, diagnosis, or review;
- requirements or architecture calibration that must precede implementation;
- a consequential unresolved choice that determines the solution;
- a fully mechanical edit with no meaningful implementation-shape decision;
- a task whose primary goal is post-hoc subtraction or general correctness, security, performance, or architecture review.

Task size alone does not determine invocation. For a large effort, form and revise an envelope for the current accepted milestone or work unit rather than treating the entire project as one small change.

### Establish The Task Contract

Before editing, determine from the available authoritative context:

- the observable behavior to add, change, or fix;
- relevant behavior and contracts to preserve;
- explicit constraints, non-goals, and accepted architecture;
- evidence that can verify the result.

Resolve minor, local, reversible choices from repository evidence and normal engineering judgment. If unresolved interpretations would materially change external behavior, architecture, risk, or the task contract, stop before editing and request the decision under the Engineering Policy's ambiguity boundary.

### Resolve Implementation Context

For existing software, inspect the target code, nearby tests, relevant callers or dependencies, and semantically similar implementations before creating equivalents. Reuse only when semantics match and reuse does not force unsupported scope.

For greenfield software, inspect the selected runtime, standard library, dependencies, framework mechanisms, accepted design, and delivery constraints. Create only the modules, public surfaces, configuration, and operational mechanisms required by the current task contract. Do not invent general frameworks or extension points merely because no repository implementation exists yet.

### Form A Change Envelope

Form a compact, revisable expectation for the current work unit:

- production areas to create or modify;
- public APIs and compatibility surfaces;
- modules, subsystem boundaries, and abstractions;
- dependencies;
- configuration, schema, migrations, and deployment requirements;
- verification.

Use counts or LOC only when they reveal unexpected growth. Do not turn the envelope into a hard limit or a required user-facing plan. Show it when the user asks, when a material assumption needs confirmation, or when a deviation changes public surfaces, dependencies, data, deployment, or structure. Otherwise report only material deviations in the final handoff.

### Choose The Lowest-Cost Valid Shape

When multiple approaches satisfy the same contract, prefer this order:

1. use an already available mechanism with matching semantics;
2. add or modify the smallest coherent local implementation;
3. introduce shared structure for concrete current uses or an accepted invariant;
4. introduce a dependency or architectural mechanism only when current evidence requires it.

This is a preference, not a constraint. Repository architecture, correctness, or a required contract may justify a later option.

### Apply The Evidence Gate

A new branch, guard, fallback, recovery path, helper, abstraction, dependency, configuration surface, public API, compatibility path, or architectural mechanism requires at least one current justification:

- an explicit requirement or acceptance criterion;
- an applicable contract, invariant, or accepted architecture;
- a reproduced failure or failing test;
- a real trust or security boundary;
- concrete current duplication or multiple current uses.

Investigate an unclear invariant before adding or removing defensive behavior. Do not use generic goals such as "production ready," "robust," or "future proof" as standalone evidence.

### Respond To Drift

Reinspect the approach when evidence requires material work outside the envelope. Search for a narrower supported path, then distinguish:

- an implementation-plan change justified by correctness or repository constraints, which revises the envelope and continues;
- a task-contract or consequential architecture change, which requires user direction before editing further;
- incidental cleanup or improvement, which remains outside the task.

Do not ask merely because the implementation needs more files than expected. Ask only when the new evidence changes a user-owned decision or authorized outcome.

### Verify, Inspect, And Stop

Run the narrowest relevant verification first, then broader checks in proportion to the affected boundary and repository requirements. Do not weaken valid tests to make the implementation pass.

Before completion, perform a lightweight task-diff inspection. Every meaningful production hunk must implement required behavior, preserve a required contract, fix demonstrated cause, support necessary verification, or enable another justified hunk. This inspection prevents residual edits but is not a dedicated subtractive review.

Stop when the task contract is satisfied, verification passes or its limits are explicit, and every remaining production hunk has a task-related justification.

### Optional Handoff

After a non-trivial implementation, a dedicated subtractive review may be useful when the verified result contains new branches, fallbacks, modules, abstractions, dependencies, configuration, public surfaces, abandoned implementation paths, or material envelope growth.

If an available Skill clearly matches that task state, the agent may hand off semantically. Do not require a particular Skill name, assume its internal contract, or block completion when no matching Skill is available. `bounded-implementation` remains independently complete.

## `subtractive-code-review`

### Task Class And Failure Modes

Use this Skill when the primary goal is evidence-backed deletion or simplification in either a completed task diff or a bounded existing code area. It may review only or apply changes according to the user's authorization.

The baseline failures it is intended to reduce are:

- leaving residual edits, abandoned branches, speculative abstractions, duplicated capability, or unrelated cleanup in a completed change;
- treating aesthetic preference or lower LOC as sufficient evidence for deletion;
- deleting required validation, error handling, security, compatibility, tests, or architectural structure;
- expanding a simplification into redesign;
- modifying existing code during a review-only request;
- inventing candidates when no supported reduction exists.

### Invocation Boundary

Invoke for an explicit subtractive review or simplification request, or when a completed non-trivial implementation has reached a state where dedicated subtraction is the remaining task.

Do not invoke when the primary need is implementation planning, feature construction, general correctness, security, performance, architecture, or an unbounded repository cleanup review.

### Choose The Review Mode

Use one mode per bounded review:

- **Task Diff Mode:** review code introduced or modified by the current task. Pre-existing code may supply evidence but is not independent cleanup scope.
- **Existing Code Mode:** review a user-specified or clearly inferable bounded file, module, package, or subsystem. Investigation may include relevant callers, tests, contracts, and dynamic-use mechanisms, but the reduction scope must not silently expand to the repository.

For a review-only request, report supported candidates without editing. For an authorized simplification, apply only supported reductions and verify them.

### Establish What Must Remain

Before identifying reductions, determine:

- required behavior and the motivating task or maintenance goal;
- repository, public API, compatibility, and architectural contracts;
- invariants, trust boundaries, and supported versions;
- tests or checks that establish correctness;
- reflection, registration, plugin, configuration, or other dynamic-use paths when relevant.

Existing Code Mode requires stronger evidence because historical intent and external consumers may not be visible in a task diff. If the preservation contract or review scope cannot be established, keep the uncertainty visible and limit the result to supported observations.

### Identify And Classify Candidates

Look for bounded-scope candidates such as:

- residual state, branches, helpers, debugging, conversions, or workarounds from abandoned paths;
- capability that duplicates a semantically equivalent implementation;
- wrappers, interfaces, factories, adapters, generic helpers, configuration layers, or extension points without a current purpose;
- unrelated cleanup, renames, formatting, dependencies, or configuration;
- defensive branches excluded by an established invariant;
- compatibility code outside an established support contract;
- comments that add no information beyond the code.

Classify only candidates:

- **DELETE:** remove without changing required behavior;
- **SIMPLIFY:** preserve required behavior with less unsupported structure;
- **DEFER:** a plausible reduction lacks enough evidence or verification for safe change.

Evidence for DELETE or SIMPLIFY may include no reachable or dynamic use, equivalent repository semantics, an established invariant, the absence of a remaining abstraction purpose, applicable support policy, focused verification, or static analysis. Aesthetic preference is not evidence, and uncertainty requires DEFER rather than deletion.

### Reduce Without Redesigning

Prefer delete, then inline or simplify, then replace. Do not introduce a new public API, dependency, configuration surface, file, or architectural layer merely to make the reviewed code smaller. If reduction requires redesign, classify it as DEFER and hand the issue to the method that owns architecture or implementation.

Do not remove a regression test because production code becomes smaller. Remove a test only when it covers behavior outside the accepted scope or duplicates equivalent evidence without weakening the remaining assertions.

### Apply, Verify, And Stop

For authorized changes, apply only supported DELETE and SIMPLIFY candidates. Run the narrowest relevant verification, then broader checks when a package, module, API, data, or repository boundary is affected.

After reduction, confirm that required behavior remains represented, no required defense or compatibility was lost, no test was weakened, no new unsupported scope was introduced, and the remaining reviewed code is justified by the preservation contract.

Stop when no further evidence-backed reduction remains. Report DELETE and SIMPLIFY with evidence and verification; report DEFER with the missing evidence. If no supported candidate exists, say so directly.

## Independence And Precedence

Each Skill must establish its own inputs, permissions, evidence, and completion conditions. Neither is a required dependency of the other. A project or user Skill with the same name may replace the Package default through Pi's `Project > User > Package` precedence; Package Skills must not assume that an overridden Skill preserves this design.

The Package must not add a separate orchestrator solely to force the two Skills into a pipeline. Cooperation remains a task-state decision made through normal Skill discovery and the Engineering Policy's smallest-applicable-set policy.

## Evaluation Contract

Behavior evaluation must distinguish:

- positive and negative Skill selection;
- correctness and preservation from reduction outcomes;
- review-only behavior from authorized edits;
- Task Diff Mode from Existing Code Mode;
- independent Skill behavior from optional handoff behavior;
- safe uncertainty and DEFER from unsupported deletion;
- current Policy, revised Policy, and Skill effects.

Correctness, contract preservation, required defenses, authorization, bounded scope, and proportional verification are mandatory gates. Reuse, fewer unsupported concepts, fewer unrelated hunks, supported deletion, and timely stopping are improvement outcomes. LOC and changed-file counts remain secondary diagnostics.

The completed [Engineering Minimality Behavior Evaluation](plans/archive/engineering-minimality-evaluation.md) preserves the concrete fixtures, comparison conditions, sampling, evidence capture, and applied release-blocking criteria.

## Invariants And Failure Handling

- Missing repository instructions, tests, or static checks do not authorize invented contracts; use the strongest available evidence and state the limitation.
- A missing or overridden companion Skill does not block either Skill's independent completion.
- Pre-existing failures remain visible and are not silently absorbed into the task.
- Required validation and defenses remain when their boundary or invariant is uncertain.
- Unbounded cleanup and redesign are handed off rather than smuggled into implementation or subtraction.
- No Skill may infer edit permission from a review-only request.

## Tradeoffs

Two independently complete Skills may repeat a small amount of context establishment when used sequentially. That cost is accepted to preserve standalone use, user overrides, failure isolation, and bounded responsibility. Semantic handoff is less deterministic than a hard pipeline, so selection and cooperation require explicit evaluation across representative models.
