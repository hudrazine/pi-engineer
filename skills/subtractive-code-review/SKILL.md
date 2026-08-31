---
name: subtractive-code-review
description: "Review a completed task diff or bounded existing code area for evidence-backed deletion or simplification while preserving required behavior, contracts, defenses, authorization, and verification. Use when subtraction is the primary goal, in review-only or authorized-edit mode. Avoid implementation planning, feature construction, general correctness, security, performance, or architecture review, and unbounded cleanup."
---

# Subtractive Code Review

Find code that can be deleted or simplified with concrete evidence, without turning the review into redesign.

Correctness takes priority over reduction. Preserve required behavior, contracts, invariants, security controls, defenses, compatibility, tests, and verification even when they make the result larger.

## Confirm Scope And Authority

Use this Skill for an explicit subtractive review or simplification request, or when a completed non-trivial implementation has reached a state where dedicated subtraction is the remaining task.

Do not use it when the primary need is implementation planning, feature construction, or general correctness, security, performance, or architecture review. Reject an unbounded repository cleanup scope until a bounded area and preservation contract can be established.

Respect the requested authority:

- for a review-only request, report supported candidates without editing.
- for an authorized simplification, apply only supported reductions and verify them.

Never infer edit permission from a request for findings or review.

## Choose One Review Mode

- **Task Diff Mode:** Review code introduced or modified by the completed task. Pre-existing code may provide evidence but is not independent cleanup scope.
- **Existing Code Mode:** Review a user-specified or clearly inferable bounded file, module, package, or subsystem. Inspect relevant callers, tests, contracts, and dynamic-use mechanisms as evidence without silently expanding the reduction scope.

Use one mode per bounded review. Existing Code Mode requires stronger evidence because historical intent and external consumers may not be visible.

## Establish What Must Remain

Before proposing reductions, determine:

- required behavior and the motivating task or maintenance goal
- repository, public API, compatibility, and architectural contracts
- invariants, trust boundaries, and supported versions
- tests or checks that establish correctness
- reflection, registration, plugin, configuration, or other dynamic-use paths when relevant

If the preservation contract or bounded scope cannot be established, keep the uncertainty visible and limit the result to supported observations. Missing tests or instructions do not authorize an invented contract or deletion.

## Identify And Classify Candidates

Look within the bounded scope for:

- residual state, branches, helpers, debugging, conversions, or workarounds from abandoned paths
- capability duplicating a semantically equivalent implementation
- wrappers, interfaces, factories, adapters, generic helpers, configuration layers, or extension points without a current purpose
- unrelated cleanup, renames, formatting, dependencies, or configuration
- defensive branches excluded by an established invariant
- compatibility code outside an established support contract
- comments that add no information beyond the code

Classify only plausible reductions:

- **DELETE:** remove without changing required behavior.
- **SIMPLIFY:** preserve required behavior with less unsupported structure.
- **DEFER:** a plausible reduction lacks enough evidence or verification for safe change.

If no supported candidate exists, say so without inventing work.

## Require Evidence

Support DELETE or SIMPLIFY with evidence such as:

- no reachable or dynamic use remains
- an existing implementation has equivalent semantics
- an established invariant makes a branch unreachable
- an abstraction has no remaining purpose after its only use is inlined
- an applicable support policy excludes the compatibility path
- focused verification or static analysis confirms the reduction

Aesthetic preference and lower LOC are not evidence. Uncertainty requires DEFER rather than deletion. Do not remove a defense when its boundary or invariant remains uncertain.

## Reduce Without Redesigning

Prefer deletion, then inline or simplify, then replace. Do not add a public API, dependency, configuration surface, file, or architectural layer merely to make reviewed code smaller. If reduction requires redesign, classify it as DEFER and hand it to the method that owns architecture or implementation.

Do not remove a regression test because production code became smaller. Remove a test only when it covers behavior outside the accepted scope or duplicates equivalent evidence without weakening the remaining assertions.

## Apply, Verify, And Stop

For authorized changes, apply only supported DELETE and SIMPLIFY candidates. Run the narrowest relevant verification, then broader checks when the reduction affects a package, module, API, data, or repository boundary.

Confirm that required behavior remains represented, no required defense or compatibility was lost, no test was weakened, no unsupported scope was introduced, and the remaining reviewed code is justified by the preservation contract.

Stop when no further evidence-backed reduction remains. Report DELETE and SIMPLIFY with evidence and verification, and DEFER with the missing evidence. If no reduction was applied, state that directly.
