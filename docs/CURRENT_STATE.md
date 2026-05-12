# Revival Bible v3 — CURRENT_STATE

Last updated: 2026-05-12 CDT

## Stable architecture state

Revival Bible v3 currently has a safe local editorial archive architecture with staged source intake and review candidates that do not mutate canon automatically.

Important stable principles:

- Canon remains protected during source staging and review intake.
- Imported/staged material must preserve provenance.
- Duplicate information should not be injected automatically.
- Possible duplicates should be routed through soft-merge/manual review.
- Contradictions should be flagged for manual review.
- Sessions can be used internally for grouping, audit, recovery, provenance, and rollback.
- Sessions should not feel like a required admin-first step for users attaching a source.

## Editorial Ingestion current behavior

Recent Phase 42 work established:

- staged source attachment
- native file picker flow
- source label/type/provenance autofill after choosing a source
- auto-created intake session when a source is attached without an existing/manual session
- visible source attachment confirmation
- manual review candidate staging
- required field markers and validation paths
- non-canon review candidates
- Review Workspace/List counters connected to review-list state
- Review List scroll and staged item visibility improvements

## Known active UX concerns

The remaining problems are primarily UI/workflow stabilization, not core architecture:

- Review List cards are too cramped and can be hard to understand.
- Tag/chip/badge wrapping can break or overlap.
- Some card hierarchy/truncation makes item identity unclear.
- Review List scroll/clipping may need a broader responsive pass.
- The Review Workspace can still feel like a metrics/admin dashboard instead of an editorial review surface.
- Next-step guidance after staging should remain clearer and calmer.
- The left intake side should continue moving toward source-first workflow rather than session-admin-first workflow.

## Current project direction

Move into:

**Phase 43 — Editorial Ingestion Workflow Stabilization**

Recommended first subphase:

**Phase 43A — Review List readability + card hierarchy**

Reason:
The Review List is the central destination for staged material. It must be readable and trustworthy before tag/chip polish, scroll polish, or action clarity can be fully validated.

## Guardrails for next work

- Do not mutate canon.
- Do not alter canon promotion behavior unless explicitly scoped.
- Do not redesign Dashboard during Phase 43 ingestion stabilization.
- Do not begin extraction automation yet.
- Do not remove the session architecture.
- Do not make users manually create sessions before attaching source files.
- Keep changes surgical and phase-specific.
- Prefer calm editorial language over admin/metrics language.
