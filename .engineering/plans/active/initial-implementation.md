---
type: plan
status: active
---

# Initial Implementation Plan

## Goal

Replace the starter scaffold with a tested Pi Extension that implements the accepted `pi-engineer` system-prompt design and is ready for manual behavior evaluation before an initial package release.

## Current State

- `package.json` identifies the package as `pi-engineer`, registers `src/index.ts` as a Pi Extension, and requires Pi `>=0.84.0`.
- The installed development version of `@earendil-works/pi-coding-agent` is 0.84.2; type, runtime-export, and jiti loading checks also pass with 0.84.0.
- `src/index.ts` registers root prompt replacement and `/pi-engineer status`; `src/system-prompt.ts` owns Portable Core v0.3 and Runtime Layer assembly.
- Focused tests cover prompt assembly, custom-prompt precedence, notification behavior, status output, and deterministic output.
- README documents installation, customization, precedence, and compatibility limits.
- Manual model behavior evaluation remains intentionally deferred.

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
- [x] Add the Portable Core v0.3 as the stable policy input.
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
- [ ] Evaluate the 22 fixed behavior scenarios manually against representative models and record outcomes and material gaps before changing the Portable Core.
- [x] Make the Portable Core TypeScript constant authoritative for exact prompt bytes and remove the duplicate full text from the design document.
- [x] Replace the starter README with installation, usage, additive customization, precedence, compatibility, and limitation guidance.
- [x] Run `vp run check` and `vp run test`.
- [x] Reconcile implemented behavior with the product, architecture, design, and decision documents.

## Verification Strategy

Unit tests should treat the builder as a deterministic transformation from structured inputs to text. Tests should prefer exact output for small renderers and representative snapshots or full-string assertions for complete assembly.

Behavior scenarios test the policy's effect rather than the string builder. Version 0.1 assesses them manually and records the model, result, observed behavior, and material concerns. The result must distinguish `pass`, `partial`, `fail`, and `untested` cases.

Automated model evaluation is deferred until repeated manual cost or observed failure patterns provide evidence for the required harness and scoring design.

## Remaining Work

- Evaluate the 22 fixed behavior scenarios manually against representative models, record each outcome and material concern, then address any material failure before v0.1 release.
- Archive this plan after manual evaluation and release readiness are complete.

## Completion Criteria

- Pi can load the Package and receive the assembled `pi-engineer` prompt when no explicit custom prompt is active.
- An explicit custom prompt remains authoritative.
- All supported structured inputs are preserved according to the design.
- Stable inputs produce byte-for-byte stable output.
- Focused tests cover the accepted runtime and conflict contracts.
- Manual behavior-evaluation results are recorded, and no known failure contradicts a v0.1 acceptance criterion.
- The README enables a user to install and configure the Package without reading maintainer documentation.
- `vp run check` and `vp run test` pass.
- The System Overview reflects the verified implementation and is promoted from `draft` to `active`.
- This plan is archived or removed after its remaining durable knowledge is routed to authoritative documents.
