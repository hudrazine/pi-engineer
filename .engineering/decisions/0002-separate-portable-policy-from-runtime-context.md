---
type: adr
status: accepted
---

# ADR-0002: Separate Portable Policy from Runtime Context

## Context

The source behavioral guidance includes both general engineering judgment and product-specific procedures. Pi sessions can vary by model, active tools, Extensions, operating system, project instructions, and Skills.

## Decision Drivers

- Stable behavioral rules should remain understandable across Pi configurations.
- Instructions must not refer to tools or capabilities that are absent.
- Pi-specific changes should not require rewriting the entire policy.
- The prompt should remain small enough that each persistent rule has a clear behavioral purpose.

## Options Considered

### Port the source prompt as one static document

This would be direct, but it would retain Codex identity, channels, tool procedures, renderer rules, and product-specific operational history.

### Copy and modify Pi's default prompt

This would initially match Pi's formatting, but it would couple maintenance to Pi's internal builder and duplicate information already available as structured runtime data.

### Separate stable policy from a runtime adapter

This keeps general behavior static while deriving tool and environment guidance from the active session.

## Decision

Split the prompt into a Portable Core and a Runtime Layer. The Portable Core owns general software-engineering judgment. The Runtime Layer owns capability-dependent guidance and rendering of Pi-resolved inputs.

## Rationale

This boundary preserves the useful policy while removing model, tool, UI, and repository coupling. It also lets optional Pi Extensions contribute prompt metadata without forcing `pi-engineer` to know each Extension in advance.

## Consequences

- New instructions must be routed to the narrowest component with enough context to own them.
- Tool procedures belong to tool descriptions, snippets, guidelines, or Skills rather than the Portable Core.
- The Runtime Layer requires deterministic conditional rendering and focused tests.
- Some short overlap is acceptable when the layers own different questions, such as Skill-use policy versus Skill location formatting.
