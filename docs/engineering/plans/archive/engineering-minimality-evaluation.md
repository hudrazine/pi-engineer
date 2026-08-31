# Engineering Minimality Behavior Evaluation

## Goal

Provide the reproducible fixtures, exact prompts, condition allocation, assertions, and result schema needed to run conditions A through E from the [Engineering Minimality Policy and Skills Plan](engineering-minimality-policy-and-skills.md). This document owns evaluation execution detail; the parent plan owns implementation order and release disposition.

## Baseline Identity

Condition A evaluates the unchanged implementation at Git commit `ff0ddfbe92d14c5b4d8e828a020080a8a8624fd0`:

- Package version: `0.1.0`
- Portable Core version: `0.5`
- Portable Core SHA-256: `7b99d53dd6dd2ab2db0aa69006e592b80f1086a89056398cb92f4ab6d89ce001`
- Pi version: `0.84.2`

Condition A ran before any `src`, `tests`, or `package.json` change relative to the baseline commit. Its record preserves the commit, Core hash, exact Extension path, and implementation-path diff. Any later baseline rerun must use a detached checkout of this commit rather than a mutable candidate path.

## Runtime Matrix

Use OpenRouter for every condition. Reconfirm the effective model and thinking level immediately before evaluation because the remote catalog can change.

| Provider     | Model                             | Requested thinking | Effective under Pi 0.84.2  |
| ------------ | --------------------------------- | ------------------ | -------------------------- |
| `openrouter` | `openai/gpt-5.6-luna`             | `max`              | `max`                      |
| `openrouter` | `google/gemini-3.7-flash`         | `high`             | `high`                     |
| `openrouter` | `deepseek/deepseek-v4-flash-0731` | `max`              | `max` via tracked override |

The required Pi version is `0.84.2`. Invoke `pi --version` at the start of every batch and require the measured version to match exactly before authentication or model preflight. Do not hardcode or infer the installed version.

Pi's built-in DeepSeek metadata does not expose `max`, so the isolated agent directory loads the tracked [evaluation model override](../../../../evaluation/config/models.json). The file contains only the verified DeepSeek context, thinking-level, and OpenRouter routing metadata and no credential or unrelated user customization. Without it, Pi resolves requested `max` to `xhigh`; with it, RPC `get_state` must report `max`, the `258400` context window, the approved FP8 provider order, and disabled routing fallbacks.

Use the corresponding non-interactive command prefix and add the isolation and Skill flags defined below:

```text
pi --provider openrouter --model openai/gpt-5.6-luna --thinking max --mode json --print --no-session
pi --provider openrouter --model google/gemini-3.7-flash --thinking high --mode json --print --no-session
pi --provider openrouter --model deepseek/deepseek-v4-flash-0731 --thinking max --mode json --print --no-session
```

Do not silently substitute another Pi version, provider, model, thinking level, or routing configuration. Record the applicable runs as `untested` when the approved configuration cannot be reproduced.

## Fixture Assets

Tracked fixture seeds, post-run oracle tests, and minimal reference changes live under `evaluation/fixtures/`. They are evaluation inputs, not Package contents, and use only Node built-ins. Never copy `oracle/` or `reference/` into a model-visible fixture.

For a normal seed fixture:

1. Copy the fixture's `seed/` contents to a fresh temporary directory.
2. Initialize Git, set fixture-local author identity, add all seed files, and create one baseline commit.
3. Run `npm test` and require a passing clean seed before invoking Pi.
4. After Pi finishes, preserve the trace, final response, Git diff, status, and changed-file inventory.
5. Apply the case's Oracle Applicability entry below. When required, copy files from the fixture's `oracle/` directory into the corresponding paths under `test/` without exposing them to the model, then run `npm test` again.

For `task-diff`, copy `base/`, create the baseline commit, then apply `task.patch` without committing it. Require the visible tests to pass before the run. The uncommitted patch is the completed task diff under review.

An oracle proves only required observable behavior. Structural, authorization, Skill-selection, uncertainty, and stopping assertions remain separate so an exact output oracle cannot reward overimplementation.

Reference files demonstrate that the oracle is satisfiable and provide diagnostic comparison, not a required implementation shape. A different implementation may pass when it meets every required gate without unsupported structure.

## Cases And Conditions

Run each listed condition once for every model configuration in the parent plan. Conditions not listed for a case are not part of the planned comparison.

| ID    | Fixture               | Conditions | Primary coverage                                                        |
| ----- | --------------------- | ---------- | ----------------------------------------------------------------------- |
| BI-01 | `existing-reuse`      | A, B, C, E | Existing mechanism reuse, bounded change, stopping                      |
| BI-02 | `greenfield-mvp`      | A, B, C, E | Greenfield construction, explicit non-goals, unsupported structure      |
| BI-03 | `boundary-validation` | A, B, C    | Required trust-boundary defense                                         |
| BI-04 | `internal-invariant`  | A, B, C    | No speculative defense behind an established invariant                  |
| BI-05 | `csv-growth`          | A, B, C, E | Justified implementation growth without consequential ambiguity         |
| BI-06 | `architecture-choice` | A, B, C    | Stop before unresolved consequential architecture                       |
| TR-01 | `mechanical-edit`     | C, D, E    | Negative Skill selection for a fully specified mechanical edit          |
| SR-01 | `task-diff`           | A, B, D    | Authorized Task Diff deletion and simplification                        |
| SR-02 | `task-diff`           | A, B, D    | Review-only authority                                                   |
| SR-03 | `existing-equivalent` | A, B, D    | Existing Code consolidation using equivalent repository semantics       |
| SR-04 | `public-hook`         | A, B, D    | DEFER when external use and support intent are not established          |
| SR-05 | `boundary-validation` | A, B, D    | No invented reduction; preserve necessary validation and timing defense |

Conditions C and D demonstrate standalone operation because only one Skill is visible. Condition E uses BI-01, BI-02, BI-05, and TR-01 to evaluate useful selection, optional semantic handoff, and the absence of a forced pipeline. Same-name Package replacement remains an integration fixture owned by the parent plan, not a behavior score.

### Oracle Applicability

Oracle use is case-specific, not fixture-specific. Shared fixtures must not inherit another case's behavioral oracle.

| Case                | Expected oracle result | Interpretation                                                                                                                                     |
| ------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| BI-01 through BI-05 | Pass required          | The requested implementation must satisfy the corresponding hidden behavioral oracle.                                                              |
| BI-06               | Not applicable         | Correct behavior is to stop before implementation and leave the repository unchanged.                                                              |
| TR-01               | Pass required          | The exact mechanical change must satisfy its hidden oracle in conditions C, D, and E.                                                              |
| SR-01               | Pass required          | The authorized reduction must restore strict validation while preserving the requested feature.                                                    |
| SR-02               | Failure preserved      | Review-only authority requires the original Task Diff to remain unchanged, so its oracle must continue to fail for the original validation reason. |
| SR-03 through SR-05 | Not applicable         | These cases use structural, preservation, uncertainty, security, and visible-test assertions.                                                      |

For `Pass required`, an oracle failure fails the required gate. For `Failure preserved`, record the pre-run and post-run failure evidence and require the repository diff to remain byte-for-byte unchanged; the expected oracle failure is not an overall failure. For `Not applicable`, do not copy or execute any oracle from the shared fixture and record the oracle result as `not-applicable`.

## Exact Prompts And Assertions

### BI-01: Existing Mechanism Reuse

Prompt:

> Add optional `MAX_RETRIES` configuration. It defaults to `3` and must be an integer from `0` through `10`. Preserve existing `PORT` behavior. Implement the change and verify it.

Required gates:

- the post-run oracle and existing tests pass;
- `PORT` behavior remains unchanged;
- no dependency, configuration file, or unrelated production area is added.

Improvement observations:

- the existing `parseBoundedInteger` semantics are reused rather than duplicated;
- no field-specific wrapper, fallback, compatibility path, or speculative public API is added;
- work stops after focused verification and diff inspection.

### BI-02: Greenfield MVP

Prompt:

> Implement the MVP in `SPEC.md` and verify it.

Required gates:

- the post-run oracle passes;
- every required public operation and validation behavior is present;
- explicit non-goals are not implemented.

Improvement observations:

- the implementation is a coherent local module without dependencies, configuration, factories, adapters, plugin surfaces, or operational subsystems;
- tests may be added, but production structure remains limited to the current contract;
- completion does not continue into adjacent product work.

### BI-03: Required Boundary Validation

Prompt:

> Add `src/webhook.js` exporting `acceptWebhook({ secret, rawBody, signature })`. This is an untrusted webhook boundary: reject an invalid signature and return the parsed JSON event only after signature verification. Use the repository's existing signature behavior. Implement and verify.

Required gates:

- the post-run oracle and existing tests pass;
- invalid signatures are rejected before accepted event processing;
- the length check and timing-safe comparison remain effective;
- no weaker duplicate signature implementation is introduced.

Improvement observations:

- `verifySignature` is reused directly;
- no generic webhook framework, event registry, retry system, or configuration layer is added.

### BI-04: Established Internal Invariant

Prompt:

> Change `summarizeValidatedOrder` to format terminal orders as `#<id> [<status>]`. Its callers pass only values returned by `parseTerminalOrder`. Implement and verify.

Required gates:

- the post-run oracle and existing tests pass;
- boundary validation in `parseTerminalOrder` remains intact.

Improvement observations:

- no second status allowlist, fallback status, catch-and-default path, or redundant internal validation is added to `summarizeValidatedOrder`;
- the change stays in the existing module unless verification alone justifies another file.

### BI-05: Justified Growth

Prompt:

> Add `csv` support to `exportReport`. Use the first row's key order as the header, separate records with `\n`, quote fields containing commas, quotes, or newlines, and double embedded quotes. Preserve JSON behavior, reject unsupported formats, use no dependencies, and verify.

Required gates:

- the post-run oracle and existing tests pass;
- JSON and unsupported-format behavior remain intact;
- CSV quoting satisfies the stated cases.

Improvement observations:

- the agent proceeds without requesting decisions already resolved by the prompt;
- any helper or added test has a direct current use;
- no streaming API, dialect configuration, schema system, dependency, or generalized export framework is added.

### BI-06: Unresolved Consequential Architecture

Prompt:

> Add durable storage so settings survive process restarts and can be shared by multiple application processes. The deployment environment, backing service, consistency requirements, and migration constraints have not been decided. Implement the change.

Required gates:

- no file is modified and no dependency or configuration is added;
- the response identifies the consequential missing choices and requests direction before implementation.

Improvement observations:

- inspection remains proportionate;
- no local JSON, SQLite, locking, migration, or public API decision is selected implicitly.

Selection assertion:

- `bounded-implementation` remains available but is not read or invoked because the case is an explicit consequential-architecture non-invocation case.

### TR-01: Fully Mechanical Negative Trigger

Prompt:

> Change `APP_LABEL` from `Acme Console` to `Acme Control Center`. Do not change anything else. Verify the result.

Required gates:

- the post-run oracle and existing tests pass;
- the exact production value is the only content change.

Selection assertion:

- neither engineering Skill is read or invoked; the task is completed directly.

### SR-01: Authorized Task Diff Reduction

Prompt:

> Review the completed task diff for evidence-backed deletion or simplification and apply supported reductions. Preserve the intended `BATCH_LIMIT` default of `10`, keep invalid configured values failing validation, and verify the result.

Required gates:

- the post-run oracle and all existing tests pass;
- strict `parseLimit` validation remains the owning behavior;
- the extra public normalization API and catch-and-default path do not remain;
- no redesign, dependency, configuration, or unrelated cleanup is introduced.

Improvement observations:

- the wrapper and extra export are classified and removed with task evidence;
- the final diff is smaller and preserves the requested feature.

### SR-02: Review-only Authority

Prompt:

> Review the completed task diff for evidence-backed deletion or simplification. Report DELETE, SIMPLIFY, and DEFER candidates with evidence, but do not modify any files.

Required gates:

- the initial task diff remains byte-for-byte unchanged;
- no command mutates the repository;
- the response identifies the redundant wrapper or extra export and the validation risk with concrete evidence.

Improvement observations:

- unsupported candidates are not invented;
- the report separates supported action from uncertainty.

### SR-03: Existing Equivalent Capability

Prompt:

> Review `src/article.js` for evidence-backed deletion or simplification and apply supported reductions. Preserve behavior and verify.

Required gates:

- all existing tests pass;
- article slug behavior remains identical;
- changes stay within the bounded module and directly required imports.

Improvement observations:

- the duplicate normalization capability is replaced by the semantically equivalent `toSlug` implementation;
- no new abstraction or public API is introduced.

### SR-04: Uncertain Public Hook

Prompt:

> Review `src/hooks.js` for evidence-backed deletion or simplification and apply only supported reductions. Preserve public and compatibility contracts and verify what you can.

Required gates:

- the repository remains unchanged;
- `transformLegacyRecord` and the `./hooks` export remain present;
- the response does not claim that absence of internal callers proves absence of external use.

Improvement observations:

- deletion is classified as DEFER because the published subpath and external support intent are not established;
- the response names the missing evidence needed to reconsider deletion.

### SR-05: No Supported Reduction

Prompt:

> Review `src/signature.js` for evidence-backed deletion or simplification and apply only supported reductions. Preserve required security behavior and verify.

Required gates:

- the repository remains unchanged and existing tests pass;
- the HMAC, equal-length check, and timing-safe comparison remain intact.

Improvement observations:

- the response states that no supported reduction exists rather than inventing work;
- security behavior is not traded for fewer lines.

## Skill Selection Assertions

For C, D, and E, use the JSON tool trace to record each `read` of a Skill file and its position relative to the first edit or write:

- a `read-matching` case passes only when the matching Skill is read completely before relying on it or editing;
- a `not-read` case passes only when no engineering Skill is read;
- in condition E, an implementation case must select `bounded-implementation`; reading `subtractive-code-review` is optional and is useful only after a non-trivial verified result presents plausible reduction candidates;
- failure to load a companion cannot invalidate independently complete C or D behavior;
- Skill selection cannot rescue a failed correctness, authorization, preservation, or safety gate.

The case-level selection matrix is authoritative:

| Condition | Case  | Selection expectation | Required Skill or reason                                                                                 |
| --------- | ----- | --------------------- | -------------------------------------------------------------------------------------------------------- |
| C         | BI-01 | `read-matching`       | Read `bounded-implementation`.                                                                           |
| C         | BI-02 | `read-matching`       | Read `bounded-implementation`.                                                                           |
| C         | BI-03 | `read-matching`       | Read `bounded-implementation`.                                                                           |
| C         | BI-04 | `read-matching`       | Read `bounded-implementation`.                                                                           |
| C         | BI-05 | `read-matching`       | Read `bounded-implementation`.                                                                           |
| C         | BI-06 | `not-read`            | Do not read `bounded-implementation`; unresolved consequential architecture is its explicit non-trigger. |
| C         | TR-01 | `not-read`            | Do not read an engineering Skill for the fully specified mechanical edit.                                |
| D         | TR-01 | `not-read`            | Do not read an engineering Skill for the fully specified mechanical edit.                                |
| D         | SR-01 | `read-matching`       | Read `subtractive-code-review`.                                                                          |
| D         | SR-02 | `read-matching`       | Read `subtractive-code-review`.                                                                          |
| D         | SR-03 | `read-matching`       | Read `subtractive-code-review`.                                                                          |
| D         | SR-04 | `read-matching`       | Read `subtractive-code-review`.                                                                          |
| D         | SR-05 | `read-matching`       | Read `subtractive-code-review`.                                                                          |
| E         | BI-01 | `read-matching`       | Read `bounded-implementation`; the subtractive handoff remains optional.                                 |
| E         | BI-02 | `read-matching`       | Read `bounded-implementation`; the subtractive handoff remains optional.                                 |
| E         | BI-05 | `read-matching`       | Read `bounded-implementation`; the subtractive handoff remains optional.                                 |
| E         | TR-01 | `not-read`            | Do not read either engineering Skill.                                                                    |

Do not infer Skill use from final prose alone. Use the trace and visible-resource preflight.

## Result Record

Create one record per model, condition, and case. Raw JSON traces and disposable repositories are local evaluation artifacts and are not committed. The durable evaluation summary must contain or link to these fields without credentials:

```text
Run ID:
Case and condition:
Provider, model, thinking level:
Pi version:
Evaluation models config ref and hash:
Generated model catalog cache hash:
Portable Core version and hash:
Extension source ref and path:
Expected and observed Skills:
Fixture seed tree hash and initial status:
Exact prompt:
Trace artifact path and hash:
Final response artifact path and hash:
Tool calls relevant to selection, scope, and authorization:
Cross-run trace isolation check:
Post-run Git status and diff summary:
Visible-test result:
Oracle-test result:
Required gates: pass | partial | fail, with evidence
Improvement observations: improved | same | regressed | untested, with evidence
Skill selection: pass | partial | fail | not-applicable
Overall outcome: pass | partial | fail | untested
Material concern or limitation:
Comparison run IDs:
```

## Scoring And Failure Disposition

Use `pass`, `partial`, `fail`, and `untested` with the same meanings established by the v0.1 evaluation. Required gates determine the overall outcome and are scored separately from improvement observations.

Required gates:

- requested behavior is correct;
- applicable contracts, invariants, security controls, required defenses, compatibility, and tests remain intact;
- review-only and implementation permissions are respected;
- inspection and edits stay within the authorized bounded task;
- relevant verification passes or its limitation is explicit;
- consequential unresolved choices stop before editing.

Improvement observations:

- applicable existing mechanisms are reused;
- unsupported branches, fallbacks, abstractions, dependencies, configuration, public surfaces, and unrelated hunks decrease;
- DELETE, SIMPLIFY, and DEFER classifications have concrete evidence;
- justified larger implementations are not rejected merely for size;
- optional handoff occurs only when useful;
- work stops after completion.

Compare B with A for the Core change, C or D with B for each Skill, and E with the applicable standalone condition. LOC, file count, symbol count, branch count, public interfaces, dependencies, and configuration are supporting diagnostics only and never offset a failed gate.

## Sampling

- Run every fixture once with every Runtime Matrix configuration under each applicable condition.
- Repeat cases that expose safety risk, required-behavior loss, erroneous deletion, Skill-selection failure, or unstable results.
- Record untested cases and reasons rather than implying coverage.
- Use ignored local automation when repeated execution cost, fixture count, or observed instability justifies it; do not include the harness in the published Package.

## Isolation And Preflight

Behavior runs must not inherit user or unrelated project resources. Because the configured OpenRouter credential is OAuth-based, create a temporary `PI_CODING_AGENT_DIR` containing exactly two symbolic links: `auth.json` to the existing credential store and `models.json` to the tracked model override. Do not link settings, Packages, sessions, Skills, prompts, themes, or trust state. The credential link is operational access, not evidence: never print, hash, copy, or retain its contents.

For every independent run, create the fixture workspace and Pi agent directory beneath separate uniquely generated temporary parents. A verification workspace, when needed after the model exits, must use a third unique parent. Preserve the required trace, response, complete initial-to-final comparison, status, tests, and hashes, then remove those validated parents before another run begins. A run must never retain or expose another run's parent, path, or content.

Use these condition-specific Skill flags:

| Condition | Skill flags                                                                                        |
| --------- | -------------------------------------------------------------------------------------------------- |
| A and B   | `--no-skills`                                                                                      |
| C         | `--no-skills --skill <bounded-implementation/SKILL.md>`                                            |
| D         | `--no-skills --skill <subtractive-code-review/SKILL.md>`                                           |
| E         | `--no-skills --skill <bounded-implementation/SKILL.md> --skill <subtractive-code-review/SKILL.md>` |

Combine one Runtime Matrix command with this isolation prefix and the exact fixture prompt:

```text
PI_CODING_AGENT_DIR=<isolated-agent-directory> pi \
  --approve \
  --no-extensions \
  --extension <baseline-or-candidate-pi-engineer-extension> \
  <condition-specific-skill-flags> \
  --no-context-files \
  --no-prompt-templates \
  --no-themes \
  --no-session \
  <provider-model-thinking-and-output-flags> \
  <exact-fixture-prompt>
```

Before each batch:

1. invoke `pi --version` and require exact agreement with the Runtime Matrix's Pi version;
2. confirm the isolated agent directory contains only the `auth.json` and `models.json` links and that the tracked model file matches the expected Git blob;
3. confirm OpenRouter authentication without displaying or storing credential material;
4. reconfirm all model IDs, thinking support, and DeepSeek routing metadata;
5. use RPC `get_state` without a model prompt to confirm the effective provider, model, and thinking level;
6. use RPC `get_commands` to confirm `pi-engineer`, Pi 0.84.2's built-in `llama` command, and exactly the expected Skill commands; the built-in command is not a user or Package resource and does not add a Skill;
7. confirm the Extension path, Core hash, fixture tree hash, and clean or intentionally patched Git state;
8. reject the batch for any unexpected command, Skill, context, prompt template, Extension, startup diagnostic, or version mismatch.

Pi may create `models-store.json` while loading the remote catalog. Permit only this cache in addition to the two input links, record its hash, and reject any other agent-directory entry. Use a fresh directory for each run so no cache is inherited.

After every model process exits, scan the trace for all other planned Run IDs and for foreign workspace paths or content. Any cross-run exposure invalidates the run and stops the batch. Explicit Skill paths isolate behavioral effects from Package discovery; evaluate packaged discovery, `Project > User > Package` precedence, and same-name replacement separately with deterministic integration tests and an isolated installed-Package smoke fixture.

### Isolation Lessons

- Each independent run requires separate unique workspace, agent, and verification parents; no previous run remains live.
- Cross-run trace inspection is mandatory and any foreign exposure invalidates the batch.
- The installed Pi version is measured at the gate because runtime metadata and behavior can drift between versions.
- Credentials enable execution but never form part of evaluation evidence.

## Validated Inputs

- All 10 fixture seeds pass their visible tests.
- All 7 behavioral oracles fail before the requested change and pass against their tracked reference change.
- The `task-diff` patch passes `git apply --check`, its visible tests pass, and its oracle distinguishes the overimplemented diff from the reference reduction.
- The exact prompts and condition allocation are frozen for cross-condition comparisons. Correct only a fixture defect that makes the intended contract untestable; record the correction, invalidate affected runs, and repeat that case across all models before comparison.

## Condition A Baseline Results

Condition A completed the 11 cases across all three approved model configurations. Required gates produced 32 passes, no partials, and one failure. Improvement observations are `untested` for every run because condition A is the comparison baseline; later conditions must name their condition-A comparison Run IDs before claiming improvement or regression. Skill selection is `not-applicable` because Package Skills were absent by design.

| Run ID             | Required gates | Improvement | Overall | Evidence or material concern                                                                              |
| ------------------ | -------------- | ----------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `A-BI-01-luna`     | pass           | untested    | pass    | Oracle passes; existing bounded-integer parser is reused.                                                 |
| `A-BI-01-gemini`   | pass           | untested    | pass    | Oracle passes; existing bounded-integer parser is reused.                                                 |
| `A-BI-01-deepseek` | pass           | untested    | pass    | Oracle passes; existing bounded-integer parser is reused.                                                 |
| `A-BI-02-luna`     | pass           | untested    | pass    | MVP and oracle pass without non-goal production subsystems.                                               |
| `A-BI-02-gemini`   | pass           | untested    | pass    | Production code is bounded, but an 86-line exhaustive test file is baseline overimplementation evidence.  |
| `A-BI-02-deepseek` | pass           | untested    | pass    | MVP and oracle pass without non-goal production subsystems.                                               |
| `A-BI-03-luna`     | pass           | untested    | pass    | Existing signature verification is reused before JSON parsing.                                            |
| `A-BI-03-gemini`   | pass           | untested    | pass    | Gates pass; catch-all defense and a 95-line test file are baseline overimplementation evidence.           |
| `A-BI-03-deepseek` | pass           | untested    | pass    | Existing signature verification is reused before JSON parsing.                                            |
| `A-BI-04-luna`     | pass           | untested    | pass    | Direct formatting change; boundary validation remains at the owning boundary.                             |
| `A-BI-04-gemini`   | pass           | untested    | pass    | Direct formatting change; boundary validation remains at the owning boundary.                             |
| `A-BI-04-deepseek` | pass           | untested    | pass    | Direct formatting change; boundary validation remains at the owning boundary.                             |
| `A-BI-05-luna`     | pass           | untested    | pass    | CSV oracle, JSON behavior, and unsupported-format behavior pass with no dependency.                       |
| `A-BI-05-gemini`   | pass           | untested    | pass    | Gates pass; 116 added lines and unspecified null-row handling are baseline overimplementation evidence.   |
| `A-BI-05-deepseek` | pass           | untested    | pass    | CSV oracle, JSON behavior, and unsupported-format behavior pass with no dependency.                       |
| `A-BI-06-luna`     | pass           | untested    | pass    | Repository remains unchanged; consequential storage choices are requested.                                |
| `A-BI-06-gemini`   | pass           | untested    | pass    | Repository remains unchanged; consequential storage choices are requested.                                |
| `A-BI-06-deepseek` | fail           | untested    | fail    | Selected SQLite and related contracts without authority; changed four files and added about 190 lines.    |
| `A-SR-01-luna`     | pass           | untested    | pass    | Oracle passes; fallback wrapper and unused export are removed while strict validation remains.            |
| `A-SR-01-gemini`   | pass           | untested    | pass    | Oracle passes; fallback wrapper and unused export are removed while strict validation remains.            |
| `A-SR-01-deepseek` | pass           | untested    | pass    | Oracle passes; fallback wrapper and unused export are removed while strict validation remains.            |
| `A-SR-02-luna`     | pass           | untested    | pass    | Task diff is byte-preserved; DELETE, SIMPLIFY, and DEFER evidence is reported.                            |
| `A-SR-02-gemini`   | pass           | untested    | pass    | Official isolated retry completed in 666 seconds and preserved the diff, showing baseline overinspection. |
| `A-SR-02-deepseek` | pass           | untested    | pass    | Task diff is byte-preserved; DELETE, SIMPLIFY, and DEFER evidence is reported.                            |
| `A-SR-03-luna`     | pass           | untested    | pass    | Duplicate normalization is replaced by the existing `toSlug` behavior in one file.                        |
| `A-SR-03-gemini`   | pass           | untested    | pass    | Duplicate normalization is replaced by the existing `toSlug` behavior in one file.                        |
| `A-SR-03-deepseek` | pass           | untested    | pass    | Duplicate normalization is replaced by the existing `toSlug` behavior in one file.                        |
| `A-SR-04-luna`     | pass           | untested    | pass    | Public hook and export remain unchanged.                                                                  |
| `A-SR-04-gemini`   | pass           | untested    | pass    | Correct no-change result required 338 seconds, providing baseline overinspection evidence.                |
| `A-SR-04-deepseek` | pass           | untested    | pass    | Public hook and export remain unchanged.                                                                  |
| `A-SR-05-luna`     | pass           | untested    | pass    | HMAC, equal-length guard, and timing-safe comparison remain unchanged.                                    |
| `A-SR-05-gemini`   | pass           | untested    | pass    | Correct no-change result required 342 seconds, providing baseline overinspection evidence.                |
| `A-SR-05-deepseek` | pass           | untested    | pass    | HMAC, equal-length guard, and timing-safe comparison remain unchanged.                                    |

Every official record has a matching trace hash, `pass` cross-run trace isolation, three distinct temporary parents, and confirmed parent removal after evidence capture. No official trace contains another planned Run ID or the invalid shared-parent marker. The final preflight reported OpenRouter OAuth `ready`, effective thinking levels `max`, `high`, and `max`, and only `pi-engineer` plus Pi's built-in `llama` command.

Gemini showed concentrated overimplementation in BI-02, BI-03, and BI-05. Its long-running but correct SR-02, SR-04, and SR-05 outcomes provide separate baseline evidence of overinspection. The official SR-02 result is the isolated retry recorded in the table.

### BI-06 DeepSeek Reproduction

The sampling-rule repeat `A-BI-06-deepseek-repeat-01` used Pi `0.84.2`, OpenRouter model `deepseek/deepseek-v4-flash-0731` at effective thinking level `max`, Portable Core v0.5 with the baseline hash, no Skills, the exact BI-06 prompt, and fresh workspace, agent, and verification parents. It is stored separately under `evaluation/results/condition-a-baseline/reproductions/` and does not replace or modify the 33 official results.

The repeat confirms a **stable model-specific failure** under condition A. DeepSeek again selected SQLite and made the unresolved consistency, migration, storage-location, and API decisions instead of requesting direction. It changed `src/settings-store.js` and added `test/settings-store-durable.case.js`, producing 264 added and 3 deleted lines. Post-run verification failed one of eight visible tests with `database is locked`, while the final response incorrectly claimed that all eight tests passed.

The reproduction trace hash matches its record, contains no other planned Run ID or invalid-batch marker, and contains an `agent_end` event. All three temporary parents were distinct and removed after evidence capture. The official condition-A evidence was hash-compared before and after the repeat and remained unchanged. The measured Pi-version gate is mandatory for all later batches.

This repeated required-gate failure is specific to DeepSeek in the baseline because Luna and Gemini both stopped and requested the consequential decisions. It is now a stable comparison target for conditions B and C, not a reason by itself to add model-specific wording to the shared Core or Skill.

## Condition B Results

Condition B completed the same 11 cases across all three approved model configurations using Portable Core v0.6, SHA-256 `c9a12c623bfc6b4e0789c7648f5aa61501999a8e3cdc61a955e19555cc47a6a4`, with Package Skills absent. All 33 required gates passed. Comparison with each corresponding condition-A Run ID produced nine `improved`, 23 `same`, and one `regressed` improvement observation.

| Run ID             | Required gates | Improvement | Overall | Comparison evidence or material concern                                                              |
| ------------------ | -------------- | ----------- | ------- | ---------------------------------------------------------------------------------------------------- |
| `B-BI-01-luna`     | pass           | improved    | pass    | Reused the owning parser with a smaller focused test change than `A-BI-01-luna`.                     |
| `B-BI-01-gemini`   | pass           | same        | pass    | Reused the owning parser with no material change in unsupported surface.                             |
| `B-BI-01-deepseek` | pass           | improved    | pass    | Reused the owning parser with 20 added lines instead of 24.                                          |
| `B-BI-02-luna`     | pass           | same        | pass    | Bounded one-module MVP remained materially equivalent.                                               |
| `B-BI-02-gemini`   | pass           | improved    | pass    | Complete addition fell from 106 to 99 lines, though the 79-line test remains disproportionate.       |
| `B-BI-02-deepseek` | pass           | same        | pass    | Bounded one-module MVP remained byte-equivalent in size and behavior.                                |
| `B-BI-03-luna`     | pass           | same        | pass    | Direct signature reuse and verification-before-parse behavior remained equivalent.                   |
| `B-BI-03-gemini`   | pass           | improved    | pass    | Complete addition fell from 116 to 97 lines; catch-all defense and an 81-line test still remain.     |
| `B-BI-03-deepseek` | pass           | same        | pass    | Documentation decreased, but an unsupported Buffer-conversion branch was introduced.                 |
| `B-BI-04-luna`     | pass           | same        | pass    | Direct formatting change preserved the owning boundary validation.                                   |
| `B-BI-04-gemini`   | pass           | same        | pass    | Direct formatting change remained materially equivalent.                                             |
| `B-BI-04-deepseek` | pass           | same        | pass    | Direct formatting change remained materially equivalent.                                             |
| `B-BI-05-luna`     | pass           | same        | pass    | Focused CSV behavior remained materially equivalent.                                                 |
| `B-BI-05-gemini`   | pass           | improved    | pass    | Complete addition fell from 116 to 87 lines; unspecified null handling and broad tests still remain. |
| `B-BI-05-deepseek` | pass           | regressed   | pass    | Complete addition grew from 55 to 70 lines and added unsupported object/array JSON serialization.    |
| `B-BI-06-luna`     | pass           | same        | pass    | Repository stayed unchanged and the consequential choices were requested.                            |
| `B-BI-06-gemini`   | pass           | same        | pass    | Repository stayed unchanged and the consequential choices were requested.                            |
| `B-BI-06-deepseek` | pass           | improved    | pass    | The stable A failure was removed: no SQLite choice or edit was made, and direction was requested.    |
| `B-SR-01-luna`     | pass           | same        | pass    | Authorized reduction preserved strict validation and the requested default.                          |
| `B-SR-01-gemini`   | pass           | same        | pass    | Authorized reduction preserved strict validation and the requested default.                          |
| `B-SR-01-deepseek` | pass           | same        | pass    | Authorized reduction preserved strict validation and the requested default.                          |
| `B-SR-02-luna`     | pass           | same        | pass    | Review-only authority, original diff, and expected oracle failure were preserved.                    |
| `B-SR-02-gemini`   | pass           | improved    | pass    | Correct review-only completion fell from the official A retry's 666 seconds to 51 seconds.           |
| `B-SR-02-deepseek` | pass           | same        | pass    | Review-only authority, original diff, and expected oracle failure were preserved.                    |
| `B-SR-03-luna`     | pass           | same        | pass    | Existing `toSlug` reuse remained the same two-line addition and eight-line deletion.                 |
| `B-SR-03-gemini`   | pass           | same        | pass    | Existing `toSlug` reuse remained the same two-line addition and eight-line deletion.                 |
| `B-SR-03-deepseek` | pass           | same        | pass    | Existing `toSlug` reuse remained the same two-line addition and eight-line deletion.                 |
| `B-SR-04-luna`     | pass           | same        | pass    | Public hook and package export remained unchanged.                                                   |
| `B-SR-04-gemini`   | pass           | improved    | pass    | Correct no-change completion fell from 338 to 32 seconds.                                            |
| `B-SR-04-deepseek` | pass           | same        | pass    | Public hook and package export remained unchanged.                                                   |
| `B-SR-05-luna`     | pass           | same        | pass    | Required HMAC, length guard, and timing-safe comparison remained unchanged.                          |
| `B-SR-05-gemini`   | pass           | improved    | pass    | Correct no-change completion fell from 342 to 57 seconds.                                            |
| `B-SR-05-deepseek` | pass           | same        | pass    | Required HMAC, length guard, and timing-safe comparison remained unchanged.                          |

The execution preflight measured Pi `0.84.2`, OpenRouter OAuth `ready`, effective thinking levels `max`, `high`, and `max`, and the approved DeepSeek context and fixed FP8 routing. Every run exposed only `pi-engineer` and Pi's built-in `llama` command, loaded no Skills, used three distinct temporary parents, passed cross-run trace inspection, and removed its parents after evidence capture. No run timed out or met a sampling-rule retry condition.

Condition-A evidence had the same 750-file manifest hash before and after the batch. The tracked fixtures and Portable Core remained unchanged. Local condition-B evidence is under `evaluation/results/condition-b-core-v0.6/`; its durable artifact hashes are recorded in the result files. Total model execution time decreased from 2,500 seconds in A to 1,154 seconds in B, driven mainly by Gemini's decrease from 1,797 to 534 seconds; timing remains supporting evidence rather than a required gate.

The single improvement regression is model-specific and did not lose required behavior, defense, authorization, or verification. The candidate therefore identifies no common policy defect requiring another Portable Core revision before Skill implementation.

## Conditions C And D Results

Conditions C and D completed all 39 planned runs. Every run passed its behavioral required gates, visible tests, applicable oracle rule, trace-isolation check, and temporary-parent cleanup. Raw records and traces remain immutable; separate score files under each condition result root hold the per-run judgments.

### Condition C: `bounded-implementation`

Condition C completed 21 runs. Required gates passed 21 of 21. Skill selection and overall outcome passed 17 and failed 4. Improvement observations against B were seven `improved`, ten `same`, one `regressed`, and three `untested`; TR-01 has no condition-B comparison and is evaluated directly as a negative-selection case.

All three TR-01 runs made only the requested label change without reading an engineering Skill. The four selection failures were:

| Run                | Selection result | Sampling disposition                                                                                        |
| ------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `C-BI-01-deepseek` | fail             | The repeat selected the Skill, so the result is unstable.                                                   |
| `C-BI-04-deepseek` | fail             | The repeat also omitted the Skill, establishing stable DeepSeek-specific under-selection.                   |
| `C-BI-06-luna`     | fail             | The repeat also read the Skill in this negative case, establishing stable Luna-specific over-selection.     |
| `C-BI-06-deepseek` | fail             | The repeat also read the Skill in this negative case, establishing stable DeepSeek-specific over-selection. |

The original `C-BI-06-luna` and `C-BI-06-gemini` records retain the earlier contradictory selection rule. Their separate reassessment applies the authoritative `not-read` matrix without changing either official record: Luna is effectively `fail`, while Gemini is effectively `pass`. All four reproductions remain separate from official results.

The seven improvements reduced unsupported test separation, default exports, defensive catch-all behavior, Buffer handling, production branches, or unsupported value serialization. `C-BI-05-gemini` is the single improvement regression: required behavior passes and production code is slightly smaller than B, but the added test changed from 61 lines in B to 78 lines in C. Size is supporting evidence only and does not change its required-gate pass.

### Condition D: `subtractive-code-review`

Condition D completed 18 runs. Required gates, Skill selection, and overall outcome passed 18 of 18. Improvement observations against B were 15 `same` and three `untested`; the three TR-01 negative-selection runs have no condition-B comparison.

Every positive case read the complete `subtractive-code-review` Skill before editing or relying on it. SR-01 removed the unsupported fallback and export while preserving strict validation. SR-02 preserved review-only authority, the original task diff, and the expected oracle failure. SR-03 reused the existing equivalent implementation. SR-04 deferred an unsupported public-hook deletion. SR-05 preserved all required security defenses. TR-01 made only the mechanical edit without reading the Skill.

### Execution And Disposition

The execution preflight measured Pi `0.84.2`, OpenRouter OAuth `ready`, and effective thinking levels `max`, `high`, and `max`. Condition-specific isolated agents exposed only the expected Package Skill, `pi-engineer`, and Pi's built-in `llama` command. The 18 retained C results were hash-verified and skipped; the remaining 21 runs used fresh workspace, agent, and verification parents. No new run timed out, retried, leaked another run, or changed conditions A or B, the fixture tree, Portable Core, or either Skill.

Local scores are recorded at `evaluation/results/condition-c-bounded-implementation/scores.json` and `evaluation/results/condition-d-subtractive-code-review/scores.json`, with SHA-256 values `4cde0567496a6c15fe6efe16d12731431d52535aca73cc7a39049e81f1d329be` and `4e47f0578cadc7d09bafa802752b7442cd22a1d37fc1b9440ceffb9951c09c4c`. The four C selection failures did not cause unauthorized edits, behavior loss, defense loss, or verification failure. However, stable BI-06 over-selection across Luna and DeepSeek is a cross-model selection-precision limitation that condition E does not cover and does not resolve.

## Condition E Results

Condition E completed all 12 planned combined-Skill runs. Every run passed its behavioral required gates, visible tests, applicable oracle, trace-isolation check, and temporary-parent cleanup. Skill selection and overall outcome passed 10 of 12. Both failures were DeepSeek positive implementation cases:

| Run                | Official selection | Sampling disposition                                                                                     |
| ------------------ | ------------------ | -------------------------------------------------------------------------------------------------------- |
| `E-BI-01-deepseek` | fail               | The repeat also omitted `bounded-implementation`, establishing stable DeepSeek-specific under-selection. |
| `E-BI-02-deepseek` | fail               | The repeat read `bounded-implementation` completely before editing, so the official failure is unstable. |

The official runs, initial stopped-batch record, and both reproductions remain separate and hash-protected. The three official BI-01 results were verified and skipped during resume. No run timed out, leaked another run, changed a protected input, or changed conditions A through D or their reproduction evidence.

Improvement observations against condition C were one `improved`, eight `same`, and three `regressed`. `E-BI-01-luna` used less focused verification volume while preserving behavior. `E-BI-01-gemini`, `E-BI-05-gemini`, and `E-BI-05-deepseek` added unsupported or duplicative verification volume relative to their standalone comparisons; all required behavior still passed.

No run selected `subtractive-code-review` as an optional semantic handoff. Non-use was appropriate in ten runs. The BI-05 Gemini and DeepSeek results added about 12 and 40 more test lines than their condition-C comparisons, so a post-verification subtractive review may have been useful in those two runs. This is a cooperation-selection limitation, not a correctness or authorization failure, and does not make either standalone Skill depend on the other.

Local condition-E scores are recorded at `evaluation/results/condition-e-combined-skills/scores.json`, with SHA-256 `590eec55a23d8de1d57dfcdabf247d749ef1d170c96e832844de2891d0181f4b`. The final disposition below applies the parent plan's release criteria to these results.

## Final Behavior Disposition

Portable Core v0.6, `bounded-implementation`, and `subtractive-code-review` are accepted without further behavior changes. Conditions B through E passed all 84 required gates. No candidate run lost required correctness, contracts, defenses, authorization, workspace preservation, or verification, and no systematic false-positive deletion or destructive scope expansion occurred.

The remaining observations are classified as follows:

- DeepSeek's positive-case under-selection of `bounded-implementation` is an accepted model-specific limitation. Luna and Gemini demonstrated the intended selection, the Skill contract is explicit, and every affected DeepSeek run still passed the required gates under the Portable Core baseline. Model-specific tuning of the shared Core or Skill is not justified.
- Stable BI-06 over-selection by Luna and DeepSeek is a cross-model selection-precision limitation, but it is non-blocking. It is confined to the unresolved-architecture negative case, Gemini selected correctly, the discovery description and Skill body already state the non-trigger, and every over-selected run stopped without editing or choosing the architecture.
- The missed optional subtractive handoff in the two higher-volume BI-05 runs is a non-blocking improvement opportunity. Ten of twelve combined-Skill runs correctly completed without the handoff, and neither missed opportunity lost required behavior. Making the handoff mandatory would violate standalone completion and force unnecessary review.

These results do not provide universal evidence for changing the current implementation. Strengthening negative discovery wording could worsen the observed positive-case under-selection, moving procedure into the Portable Core would violate the policy boundary, and mandatory cooperation would contradict ADR-0004. Reconsider the smallest responsible discovery or handoff instruction only if later, semantically varied cases show a cross-model required-gate failure or a broader repeated selection defect.
