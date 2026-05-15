# Revival Bible v3 — CURRENT_STATE

Last updated: 2026-05-15 CDT

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

Recent Phase 42 and Phase 43 stabilization work established:

- staged source attachment
- native file picker flow
- source label/type/provenance autofill after choosing a source
- auto-created intake session when a source is attached without an existing/manual session
- visible source attachment confirmation
- manual review candidate staging
- required field markers and validation paths
- non-canon review candidates
- Review Workspace/Review Queue counters connected to visible queue state
- Review List scroll and staged item visibility improvements
- Editorial Ingestion Source Material tab scrolls/focuses back to the Source Material section top
- Source Material readability/layout improvements
- counters stay on one row, including `Visible Review Queue`

## Review Queue current behavior

The Review Queue is flattened and item-first:

- Source/batch groups appear as context headers, not navigation gates.
- Review Queue items are visible directly without opening source batches.
- Source/batch context remains provenance, not primary navigation.
- Cards are collapsed/summary-style by default.
- The selected Review Queue card has clear styling distinct from checkbox/batch triage selection.
- Checkboxes are selection/triage controls only.
- Bulk delete/remove has not been implemented.
- Dashboard, routing, and Review Detail behavior remain stable.

## Known future backlog

These items are future work and should not be treated as completed behavior:

- safe bulk Review Queue remove/delete
- safe Review Queue item deletion
- safe source material removal, batch archive, or batch removal
- stored Source Material long-list browsing/scaling
- Editorial Intake / Review Queue status and type colored tags
- larger extraction/review automation work

## Current project direction

Hold the stabilized Editorial Ingestion / Review Queue state. Future phases should be explicit, small, and tied to a concrete issue or backlog item. Avoid further tiny visual churn while preserving calm editorial UX and canon safety.

## Guardrails for next work

- Do not mutate canon.
- Do not alter canon promotion behavior unless explicitly scoped.
- Do not redesign Dashboard during Phase 43 ingestion stabilization.
- Do not begin extraction automation yet.
- Do not remove the session architecture.
- Do not make users manually create sessions before attaching source files.
- Keep changes surgical and phase-specific.
- Prefer calm editorial language over admin/metrics language.
