# Initial Implementation Plan

## Goal

Replace the starter scaffold with a tested Pi Extension that implements the accepted `pi-engineer` system-prompt design and is ready for manual behavior evaluation before an initial package release.

## Current State

- `package.json` identifies the package as `pi-engineer`, registers `src/index.ts` as a Pi Extension, and requires Pi `>=0.84.0`.
- The installed development version of `@earendil-works/pi-coding-agent` is 0.84.2; type, runtime-export, and jiti loading checks also pass with 0.84.0.
- `src/index.ts` registers root prompt replacement and `/pi-engineer status`; `src/system-prompt.ts` owns Portable Core v0.5 and Runtime Layer assembly.
- Focused tests cover prompt assembly, custom-prompt precedence, notification behavior, status output, and deterministic output.
- README documents installation, customization, precedence, and compatibility limits.
- Manual model behavior evaluation is scoped to the six core items defined in the system-prompt design and tracked in the [v0.1 Behavior Evaluation](v0.1-behavior-evaluation.md).
- Portable Core v0.4 clears the sampled protected-root regression on both representative models. GPT Luna's inaccurate recoverability report for a permitted child deletion remains `partial` evidence but is accepted as a non-blocking model-specific reporting limitation, separate from the passed Safety boundary.
- The DeepSeek `max` core evaluation passed 5/6 items; architectural ambiguity failed 5/5 independent repetitions by implementing unresolved persistence choices without user direction.
- Portable Core v0.5 adds the minimal explicit-implementation clarification. Luna and Gemini passed the Ambiguity regression, while DeepSeek improved from 0/5 to 2/5 passing trials but still produced 3/5 failures. All three models passed minor-autonomy, fully resolved, and explicitly delegated decision cases without excessive confirmation or refusal.
- DeepSeek's remaining 3/5 Ambiguity failure is accepted as a non-blocking model-specific limitation. Portable Core v0.5 is the accepted release candidate and will not receive model-specific tuning for this result.
- GPT Luna's 3/3 inaccurate recoverability reports are also accepted as a non-blocking model-specific limitation. Portable Core v0.5 will not receive Git-specific reporting procedures for this result.

## Proposed Changes

Implement a small Extension entry point, a deterministic prompt builder, the accepted Portable Core, and focused renderers for the Runtime Layer. Verify both individual sections and full assembly before replacing the user-facing starter documentation.

The implementation should keep conceptual responsibilities distinct without creating one source file per prompt heading. Start with the fewest modules that maintain a clear boundary among Extension policy, prompt assembly, and runtime rendering.

## Tasks

- [x] Set the minimum supported Pi version to `>=0.84.0` and identify the required public API surface.
- [x] Define one notification per session at the first affected `before_agent_start` event and an on-demand status command.
- [x] Set the peer dependency range to `>=0.84.0` and verify required public APIs against the minimum version.
- [x] Replace the starter export with a Pi Extension that registers `before_agent_start`.
- [x] Track whether the `customPrompt` conflict notification has been emitted in the current Extension session.
- [x] Emit the conflict notification only when `ctx.hasUI` is true.
- [x] Register `/pi-engineer status` with active state, inactive reason, Package version, and Portable Core version.
- [x] Add the Portable Core as the stable policy input and update its protected-root Safety policy to v0.4.
- [x] Implement deterministic rendering for active tool snippets and conditional tool guidelines.
- [x] Preserve normalized Pi prompt guidelines with stable exact deduplication.
- [x] Add compact Pi documentation guidance using public path helpers.
- [x] Preserve bare `appendSystemPrompt` content.
- [x] Render project context in Pi-compatible format and received order.
- [x] Delegate Skill formatting to `formatSkillsForPrompt()` under the accepted `read` condition.
- [x] Normalize and render the current working directory last.
- [x] Omit empty optional sections and avoid volatile prompt content.
- [x] Add unit tests for custom-prompt precedence, section presence, omission, order, normalization, deduplication, context order, Skill gating, path normalization, and deterministic full output.
- [x] Compare a representative fully assembled prompt with the accepted design.
- [x] Evaluate the six v0.1 core behavior items manually against representative models and record the remaining scenarios as reasoned `untested` outcomes.
- [x] Complete and record the Portable Core v0.4 protected-root and limited-child deletion regressions in the [v0.1 Behavior Evaluation](v0.1-behavior-evaluation.md).
- [x] Complete and record the Portable Core v0.5 Ambiguity correction and flexibility regressions in the [v0.1 Behavior Evaluation](v0.1-behavior-evaluation.md).
- [x] Make the Portable Core TypeScript constant authoritative for exact prompt bytes and remove the duplicate full text from the design document.
- [x] Replace the starter README with installation, usage, additive customization, precedence, compatibility, and limitation guidance.
- [x] Run `vp run check` and `vp run test`.
- [x] Reconcile implemented behavior with the product, architecture, design, and decision documents.

## Verification Strategy

Unit tests should treat the builder as a deterministic transformation from structured inputs to text. Tests should prefer exact output for small renderers and representative snapshots or full-string assertions for complete assembly.

Behavior scenarios test the policy's effect rather than the string builder. Version 0.1 assesses the six core items manually and records the model, input, result, observed behavior, and material concerns. The remaining fixed scenarios are recorded as `untested` with a reason. Results distinguish `pass`, `partial`, `fail`, and `untested` cases.

Automated model evaluation is deferred until repeated manual cost or observed failure patterns provide evidence for the required harness and scoring design.

## Closure

Implementation, compatibility checks, documentation, and the scoped v0.1 behavior evaluation are complete. Portable Core v0.5 is the accepted release candidate, and the remaining model-specific deviations are documented as non-blocking known limitations.

Package version changes, release publication, and commits are intentionally outside this plan and require separate authorization.

## Completion Criteria

- Pi can load the Package and receive the assembled `pi-engineer` prompt when no explicit custom prompt is active.
- An explicit custom prompt remains authoritative.
- All supported structured inputs are preserved according to the design.
- Stable inputs produce byte-for-byte stable output.
- Focused tests cover the accepted runtime and conflict contracts.
- Manual behavior-evaluation results are recorded, and no blocking known failure contradicts a v0.1 acceptance criterion; accepted model-specific limitations are identified explicitly.
- The README enables a user to install and configure the Package without reading maintainer documentation.
- `vp run check` and `vp run test` pass.
- The System Overview reflects the verified implementation and is promoted from `draft` to `active`.
- This plan is archived or removed after its remaining durable knowledge is routed to authoritative documents.
