---
status: accepted
---

# ADR-0006: Evaluate the Completed Prompt Through the Real Extension

## Context

Core-only ablations and evaluation-generated prompts made the Harness responsible for reproducing product assembly. That increased complexity and could measure an artificial path instead of the installed Package. Model-visible access to repository evaluation assets also weakened prior evidence.

## Decision

Evaluate only the completed system prompt produced by the real `pi-engineer` Extension. Use Pi 0.85.0's standard `read`, `bash`, `edit`, and `write` tools without an evaluation Extension or tool wrappers. Control project context, Skills, and appended system text through normal Pi CLI arguments.

For initial adoption, run nine cases once across three fixed models in one 27-run campaign. Separate infrastructure `VALID` or `INVALID` from model-behavior `PASS` or `FAIL`. Require deterministic checks and human semantic review, without ablations, comparison scorers, fixed repeats, or inherited evidence.

Place each run in an external Linux sandbox. Expose only its workspace, isolated Pi directories, the Package snapshot, Pi runtime, and a credential-free OpenRouter relay. Fix exact model IDs, thinking, context windows, upstream providers, and fallback prohibition before inference.

## Consequences

Deterministic gates cover observable workspace state and tool presence. Mandatory manual review owns command semantics, verification success, and accurate reporting. Shell text plus a shell-wide exit status cannot establish the execution or success of an inner command, so command-pattern gates are excluded. Existing immutable evidence remains associated with the Harness revision that produced it.

- Evaluation follows the same Extension and prompt assembly path as the product.
- The Harness no longer decides which Core or Runtime sections exist.
- Campaign fingerprints identify all prompt, fixture, model, runtime, relay, and Harness inputs.
- Raw attempts are immutable. `--resume` skips `VALID` evidence and appends a new attempt only after `INVALID` evidence.
- Previous evaluation assets and results do not contribute to current adoption decisions and are retained only in Git history when tracked.
- Nine cases define the initial adoption campaign, not a permanent ceiling. Add cases when practical use reveals a concrete behavior question that existing cases and deterministic tests do not answer.
