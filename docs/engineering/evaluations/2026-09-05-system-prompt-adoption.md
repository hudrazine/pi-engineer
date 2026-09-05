# System Prompt Adoption Evaluation — 2026-09-05

## Decision

Adopt Engineering Policy 1.0, the fixed Pi Runtime Adapter, and the evaluated Runtime Context assembly as the current `pi-engineer` system prompt baseline. The result supports release without further prompt tuning or additional model evaluation.

Future evidence may justify a revision. A single model-specific behavior or an unsupported possibility is not enough by itself to change the shared prompt.

## Evaluated Artifact

- Engineering Policy version: `1.0`
- Engineering Policy SHA-256: `4a8d68a39b140221d30db0d1f3837d716e3211bf038a98876fc4e0e3315e909c`
- Pi Runtime Adapter SHA-256: `3f1ac373e2d76551d855f729899afe3d4b66437f236afc585943d060f2598316`
- Pi version: `0.85.0`
- Campaign fingerprint: `9f5111ebed53ecb41c4532321488e8047812264eea03b30088d2f8c7994f3112`
- Evaluation contract: [System Prompt Evaluation](../evaluation.md)

The campaign used the completed prompt produced by the real Package Extension. It did not replace the prompt with evaluation-only text, remove Runtime Context sections, use a tool-control Extension, or inherit evidence from another campaign.

## Outcome

The campaign completed all 27 logical runs: nine cases run once on each of three fixed models.

| Result                   | Count |
| ------------------------ | ----: |
| Infrastructure `VALID`   |    27 |
| Infrastructure `INVALID` |     0 |
| Automatic `PASS`         |    27 |
| Manual `PASS`            |    27 |
| Final `PASS`             |    27 |
| Relay violations         |     0 |

Every logical run completed on its first attempt, so the campaign did not require `--resume`. Human review examined each trace, final response, tool evidence, workspace difference, and automatic result before assigning the final outcome.

The nine cases observed evidence-based review, bounded implementation, autonomous minor choice, stopping before an unresolved material choice, application of a resolved project instruction without publication, bounded Skill use, appended verification guidance, stopping before ambiguous deletion, and recoverable authorized removal. All three models passed each observed case.

## Interpretation Limits

- Each model and case combination ran once. The result does not establish repeated stability or a statistical success rate.
- The campaign evaluated the completed prompt. It does not establish the causal contribution or independent necessity of an individual Engineering Policy clause, the Runtime Adapter, or another section.
- The fixed synthetic fixtures and standard `read`, `bash`, `edit`, and `write` tools do not represent every repository, tool set, external operation, or destructive-action boundary.
- Automatic checks cover observable workspace state and tool presence. Human review remains necessary for command semantics, verification success, transient actions, and reporting accuracy.
- The models differed in exploration cost and reporting precision even when their final behavior passed. Model independence means shared behavioral direction, not identical execution.
- A 3/3 result means three observed passes in this matrix. It is not a claim of universal model compliance.

These limits do not block adoption because the campaign found no shared prompt failure, infrastructure invalidity, relay violation, or recurring safety defect. Add evaluation cases when practical use reveals a concrete behavior question that the current suite does not answer.

## Re-evaluation Boundary

A new completed-prompt campaign is required when the exact Engineering Policy or Runtime Adapter bytes change, the completed prompt assembly changes materially, or the evaluated Pi runtime contract changes. Documentation-only changes and newly recorded interpretation do not require model evaluation.
