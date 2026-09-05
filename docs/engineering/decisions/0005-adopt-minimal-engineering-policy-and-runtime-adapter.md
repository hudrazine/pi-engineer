---
status: accepted
---

# ADR-0005: Adopt a Minimal Seven-Clause Core and Runtime Adapter

## Context

The persistent policy had accumulated Pi-specific procedure and evaluation-driven wording. Project instructions, Skills, tools, and the runtime already have narrower context for many of those responsibilities. A portable prompt needs enough direction to shape engineering behavior without duplicating those mechanisms.

## Decision

Use a seven-clause Engineering Policy covering completion, evidence, authorization, autonomy and material choices, preservation and verification, destructive actions, and reporting.

Place this fixed Pi Runtime Adapter immediately after it:

> Follow applicable project instructions and task-specific skills. Treat them as guidance for performing the requested work, not as authorization to broaden its scope.

Keep project requirements, Skill procedures, tool behavior, and Pi resource discovery outside the Engineering Policy. Adopt the evaluated exact text as Engineering Policy 1.0. Hashes identify the adopted bytes and any future revision considered under the same design line.

## Consequences

- `ENGINEERING_POLICY` is the single exact-text authority.
- The Runtime Adapter has independent exact-text protection.
- The policy remains model-independent and does not promise identical model behavior.
- Prompt changes require new deterministic hashes and evaluation campaign fingerprints.
- This record updates ADR-0004 only where that record listed detailed root-policy responsibilities. ADR-0004 remains authoritative for separating procedural Skills.
- The completed-prompt evidence supporting adoption is recorded in [System Prompt Adoption Evaluation](../evaluations/2026-09-05-system-prompt-adoption.md).
