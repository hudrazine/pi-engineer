---
type: plan
status: archived
---

# Engineering Minimality Policy and Skills Plan

## Goal

Implement the accepted Portable Core refinement and the `bounded-implementation` and `subtractive-code-review` Skills, integrate them as Pi Package resources, and demonstrate through staged behavior evaluation that they reduce unsupported implementation and code without sacrificing correctness, contracts, safety, authorization, or necessary robustness.

## Current State

- Portable Core v0.6 implements the accepted universal decision priority and stopping baseline and is byte-protected by deterministic tests.
- The v0.6 change adds no localization, Evidence Gate, Change Envelope, drift, candidate-classification, or subtractive-review procedure.
- The Runtime Layer already preserves Pi-formatted available Skills when `read` is active.
- The Package manifest exposes `src`, `bounded-implementation`, and `subtractive-code-review`; both Skills are accepted, standalone, and tool-independent, with only an optional semantic handoff from completed non-trivial implementation state.
- Existing automated tests cover the v0.6 bytes and policy-procedure boundary, prompt assembly, omission, ordering, custom-prompt precedence, Extension status behavior, native Skill loading, Skill content boundaries, precedence assumptions, and packed artifact contents.
- The archived v0.1 model evaluation covers authorization, focused completion, architectural ambiguity, workspace integrity, destructive safety, and generic Skill usage. It does not isolate reuse, speculative structure, defensive overimplementation, implementation drift, bounded existing-code subtraction, or optional Skill handoff.
- Condition A completed all 33 planned baseline runs: 32 passed required gates and `A-BI-06-deepseek` failed by selecting unresolved storage architecture. A separate same-condition sampling repeat reproduced the unauthorized SQLite decision and also failed visible verification, establishing a stable DeepSeek-specific baseline failure. The evaluation plan owns the results, reproduction record, and baseline concerns.
- Condition B completed all 33 Portable Core v0.6 runs with every required gate passing. Compared with A, nine runs improved, 23 were materially unchanged, and one regressed only in an improvement observation; no retry condition or release-blocking common policy defect was found.
- Conditions C and D completed all 39 planned standalone-Skill runs with every behavioral required gate passing. Condition C passed 17 of 21 Skill-selection assertions and condition D passed 18 of 18.
- Condition E completed all 12 combined-Skill runs with every behavioral required gate passing and 10 of 12 Skill-selection assertions passing. DeepSeek under-selected `bounded-implementation` in BI-01 and BI-02; sampling classified BI-01 as stable and BI-02 as unstable. No run used the optional subtractive handoff; non-use was appropriate in ten runs and missed a potentially useful review in the two higher-volume BI-05 results. The evaluation plan owns the detailed comparisons and the remaining selection limitations.
- The final behavior disposition accepts Portable Core v0.6 and both Skills without further changes. DeepSeek positive-case under-selection is an accepted model-specific limitation; BI-06 over-selection and missed optional handoffs are non-blocking improvement opportunities. No release-blocking common behavior defect remains.

The accepted architecture and behavioral contracts are defined by [ADR-0004](../../decisions/0004-separate-engineering-policy-from-procedural-skills.md), the [System Prompt Design](../../design/system-prompt.md), and the [Engineering Skills Design](../../design/engineering-skills.md). Concrete fixtures, prompts, condition allocation, assertions, and result records are preserved by the companion [Engineering Minimality Behavior Evaluation](engineering-minimality-evaluation.md).

## Constraints And Non-goals

- Keep the Portable Core model-, tool-, language-, framework-, and repository-independent.
- Do not move Evidence Gate, Change Envelope, localization, candidate classification, or subtractive procedure into the Portable Core.
- Do not make either Skill depend on the other by name or availability.
- Preserve Pi's `Project > User > Package` Skill precedence and normal discovery format.
- Do not create repository instructions, design templates, test policy, lint rules, CI gates, or fixed LOC limits.
- Do not include a model-evaluation harness in the published Package. Ignored local runners may support reproducible evaluation.
- Do not release behavior that obtains a smaller result by losing required correctness, defense, compatibility, authorization, or verification.

## Evaluation Conditions

Run and record these conditions separately:

| Condition | Portable Core | Skill state                                       | Purpose                                          |
| --------- | ------------- | ------------------------------------------------- | ------------------------------------------------ |
| A         | Current v0.5  | Package Skills absent                             | Establish the prompt-only baseline               |
| B         | v0.6          | Package Skills absent                             | Isolate the concise policy change                |
| C         | v0.6          | `bounded-implementation` available and applicable | Evaluate implementation containment              |
| D         | v0.6          | `subtractive-code-review` used independently      | Evaluate diff and existing-code subtraction      |
| E         | v0.6          | Both Skills available                             | Evaluate selection and optional semantic handoff |

The companion [Engineering Minimality Behavior Evaluation](engineering-minimality-evaluation.md) is the historical authority for the model matrix, fixtures, prompts, isolation, result schema, scoring, and sampling. This parent plan records the staged order and release disposition.

Required gates take precedence over improvement observations and size diagnostics. Unauthorized edits, loss of required behavior or defenses, destructive scope expansion, systematic false-positive deletion, or an unresolved product-wide Skill-selection failure block release. A model-specific limitation may be accepted only under the Product Context criteria and must not conceal a common contract defect.

## Tasks

### Evaluation Preparation

- [x] Select the OpenRouter model and requested thinking configurations.
- [x] Reproduce the verified DeepSeek model override in the isolated agent directory and confirm `max` as the effective level through RPC preflight.
- [x] Reconfirm model resolution and OpenRouter authentication immediately before the first recorded run without exposing credentials.
- [x] Prepare the disposable repository and isolated agent-directory procedure, condition-specific CLI commands, and expected-resource assertions from the Evaluation Isolation Protocol.
- [x] Convert the fixture matrix into tracked seed repositories, exact user inputs, independent assertions, and a result-recording schema.
- [x] Define which conditions apply to each fixture and which observations can be asserted deterministically.
- [x] Run condition A before changing the Portable Core or adding Package Skills.

### Portable Core Refinement

- [x] Draft the smallest text that encodes the accepted correctness, preservation, reuse, justified-complexity, and stopping baseline.
- [x] Add focused failing tests for the candidate version and stable text before changing `PORTABLE_CORE`.
- [x] Implement the candidate revision without copying Skill procedure into the root prompt.
- [x] Run condition B and revise only when observed behavior identifies a common policy defect.

### Skill Authoring

- [x] Author `bounded-implementation` from its accepted behavioral contract with a precise positive and negative discovery description.
- [x] Author `subtractive-code-review` with Task Diff and Existing Code modes, authority-aware output, evidence classes, and DEFER behavior.
- [x] Keep both Skill bodies standalone, tool-independent, and free of repository-specific paths or commands.
- [x] Validate the Skills against Pi's supported Agent Skills format.

### Package Integration And Deterministic Tests

- [x] Expose the Skill resources in the Pi manifest and published Package files.
- [x] Add tests for resource presence, names, descriptions, expected precedence assumptions, and packaged artifact contents.
- [x] Test Package discovery and `Project > User > Package` replacement in isolated fixtures without using those runs as Skill behavior scores.
- [x] Preserve current prompt assembly and Skill catalog behavior without adding a competing discovery format.
- [x] Update status or version reporting only if the accepted user-facing contract requires it; no change is required.

### Behavior Evaluation

- [x] Run conditions C and D against their positive, negative, failure, boundary, and regression fixtures.
- [x] Run condition E against combined positive and mechanical negative cases; standalone and replacement boundaries remain covered by conditions C and D and deterministic integration tests.
- [x] Repeat risky or unstable cases according to the sampling rules.
- [x] Compare required gates first and improvement observations second; do not optimize for smaller metrics alone.
- [x] Record model-specific limitations, common failures, and the evidence for correction or acceptance.

### Documentation And Release Readiness

- [x] Reconcile Product Context, System Overview, System Prompt Design, and Engineering Skills Design with verified implementation behavior.
- [x] Remove the pre-implementation qualification from the Skill design only after Package discovery and behavior are verified.
- [x] Update README installation, bundled-Skill behavior, precedence, customization, and limitations.
- [x] Add a Changeset describing the user-visible Package capability.
- [x] Run `vp run check`, `vp run test`, package-content verification, and a registry-installed Pi smoke test before release authorization.
- [x] Archive this plan with recorded results after all completion criteria are satisfied.

## Completion Criteria

- The Portable Core contains only the accepted universal principles and passes deterministic and staged model evaluation.
- Both Skills are discoverable from the packaged artifact, independently usable, and replaceable through normal Pi precedence.
- Positive and negative invocation, new and existing development, Task Diff and Existing Code modes, authority, uncertainty, necessary defenses, and optional handoff have recorded outcomes.
- No unresolved release-blocking required-gate failure remains.
- Any accepted model-specific limitation satisfies the Product Context criteria and is explicit in the evaluation record.
- Current-state engineering documentation and user documentation agree with the verified implementation.
- Repository checks, package-content checks, and the installed-Package smoke test pass.

## Release Readiness Result

The implementation is authorized to enter the Changesets release workflow. `vp run check` passed 89 files without formatting, lint, type, or warning findings, and `vp run test` passed all 27 tests. `vp pm pack -- --dry-run --json` produced only `LICENSE`, `README.md`, `package.json`, `src/index.ts`, `src/system-prompt.ts`, and the two Skill files.

An isolated registry-backed smoke installed the candidate artifact through Pi 0.84.2 as `npm:@hudrazine/pi-engineer@0.1.0`. The installed package contained the same seven files, exposed `/pi-engineer`, `/skill:bounded-implementation`, and `/skill:subtractive-code-review`, and reported `pi-engineer active (package 0.1.0, Portable Core 0.6)`. The temporary registry, agent directory, workspace, package cache, and installed artifact were removed after verification.

Portable Core source, both Skills, evaluation fixtures, and conditions A through E evidence retained their pre-readiness hashes. The final behavior disposition found no release-blocking common defect. Publication still follows the separate approval-gated [npm Release Procedure](../../development/release.md); the generated version pull request, workflow verification, `npm-production` approval, and post-publication registry/provenance checks are operational release steps rather than open implementation work in this plan.
