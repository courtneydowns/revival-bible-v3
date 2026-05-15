# Revival Bible v3 — PHASE_LEDGER

Last updated: 2026-05-15 CDT

## Recent phase status

### Phase 42 — Editorial Ingestion extraction triage architecture

Status: Passed / stabilized through follow-up fixes.

Summary:
Phase 42 added the staged-source and review-boundary architecture needed before real extraction/import work. Source material can be staged safely, review candidates remain non-canon, provenance is preserved, and canon counts remain unchanged.

Key outcomes:
- staged-source registration
- source attachment workflow
- native file picker work
- source/session persistence
- non-canon review candidates
- review counters/workspace clarification work
- attachment and staging success messages
- required indicators and validation paths
- source label/type/provenance autofill
- auto-created intake session on source attach when no session exists
- footer/status calmness cleanup

### Phase 42A — Attach Source stabilization

Status: Passed after fix loops.

Summary:
Stabilized source attachment, native file picker behavior, staged-source persistence, and related ingestion spacing/readability fixes.

### Phase 42B — Footer/status calmness cleanup

Status: Passed.

Files changed:
- src/components/StatusBar.jsx

Summary:
Replaced noisy visible SQLite path text with calmer local archive status language while preserving optional detail where appropriate.

### Phase 42C — Review Workspace counter clarity

Status: Passed technically, then expanded through fix loops due to broader workflow clarity issues.

Initial goal:
Clarify Review Workspace counters and align them with the visible review list.

Follow-up fixes addressed:
- stronger source attachment confirmation
- stronger staging confirmation
- required field indicators and validation paths
- source label/type/provenance autofill reliability
- Review List scroll restoration
- next-step copy
- row-level newly staged marker
- latest-staged panel layout
- auto-create intake session when attaching a source without a manual session

Important final workflow decision:
Sessions are still important internally but should not block source attachment. The UI should be source-first and auto-create/select an intake session when needed.

## Recent stabilization

### Phase 43 — Editorial Ingestion Workflow Stabilization

Status: Stabilized / hold.

Reason:
Phase 42C fix loops exposed that remaining issues are no longer isolated counter/session bugs. They are UX stabilization issues across Review List readability, chip wrapping, scroll/clipping, source-first intake flow, and editorial action clarity.

Phase 43 replaced further `42C-fixX` loops and stabilized the Editorial Ingestion / Review Queue surface without changing canon safety boundaries.

Completed stable outcomes:
- Editorial Ingestion Source Material tab scrolls/focuses back to the Source Material section top.
- Review Queue is flattened; source/batch groups are context headers, not navigation gates.
- Review Queue items are visible directly without opening source batches.
- Source/batch context remains provenance, not primary navigation.
- Review Queue cards remain collapsed/summary-style by default.
- Selected Review Queue card styling is clear and distinct from checkbox/batch triage selection.
- Review Queue checkboxes are selection/triage controls only.
- Counters stay on one row, including `Visible Review Queue`.
- Source Material readability/layout remains improved.
- Dashboard, routing, and Review Detail behavior remain stable.

Explicitly not implemented:
- bulk Review Queue delete/remove
- individual safe Review Queue item deletion
- source material removal, batch archive, or batch removal
- stored Source Material long-list browsing/scaling
- Editorial Intake / Review Queue status and type colored tags

## Future backlog

### Review Queue safety actions

- Safe bulk Review Queue remove/delete remains future work.
- Safe Review Queue item deletion remains future work.

### Source Material management

- Safe source material removal, batch archive, or batch removal remains future work.
- Stored Source Material long-list browsing/scaling remains future work.

### UI polish

- Editorial Intake / Review Queue status and type colored tags remain future UI polish.
- Avoid further tiny visual churn unless a concrete issue appears.
- Continue preserving calm editorial UX and canon safety.
