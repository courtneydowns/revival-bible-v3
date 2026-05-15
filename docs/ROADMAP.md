# Revival Bible v3 — ROADMAP

Last updated: 2026-05-15 CDT

## Current roadmap position

The project has completed the Phase 42 source/session/review safety work, recent Editorial Ingestion / Review Queue stabilization passes, and the Stored Source Material browsing stabilization cluster. The app is in a hold/stabilized state; future work should be explicitly scoped backlog work, not continued visual churn.

## Recently stabilized / completed direction

### Phase 42 — Editorial Ingestion extraction triage architecture

Phase 42 established and refined the safe staging boundary for source material and review candidates.

Key outcomes:

- staged source attachment
- native file picker support
- import/session provenance architecture
- source label/type/provenance autofill
- auto-created intake sessions when attaching a source without a manual session
- attachment confirmation copy
- non-canon review staging
- review counters tied more clearly to visible review/list state
- required field indicators and validation paths
- footer/status calmness cleanup
- canon counts remain unchanged during staging/review intake

Important workflow decision:

**Import sessions remain part of the internal architecture but should not be presented as a required admin-first step.** Source attachment should be source-first; if no session exists, the app may auto-create/select a safe intake session.

### Editorial Ingestion / Review Queue stabilization

Recent stabilization completed the key Review Queue UI decisions:

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

No bulk delete/remove workflow has been implemented yet.

Review Queue polish is paused/stable; avoid returning to it unless a concrete issue appears.

### Stored Source Material browsing stabilization

Recent source-library stabilization completed the key Stored Source Material browsing decisions:

- Stored Source Material now behaves more like a calm source library.
- Search/filter works across title/name, visible metadata, and preview/raw source text where available.
- Sort control remains available, and status copy reflects active sort.
- Source cards show calm derived-only type/status/provenance badges.
- Long-list controls show a limited number of sources first and support Show More / Show Fewer when enough sources exist.
- Batch/session browsing filters support All batches, specific batch/session filters, and an Unbatched fallback where available.
- Existing source remove behavior and confirmation semantics remain unchanged.
- Source Material tab scroll/focus behavior remains stable.
- Review Queue, Review Detail, Dashboard, counters, store, database, and canon/review state logic remain unchanged.

## Current roadmap position

Hold the stable Editorial Ingestion / Review Queue behavior. Do not start a new feature phase unless the next prompt explicitly scopes it.

This is still not extraction automation and not canon import.

## Future backlog

### Review Queue safety actions

- Safe bulk Review Queue remove/delete remains future work.
- Safe Review Queue item deletion remains future work.

### Source Material management

- Source batch archive/remove remains future work.
- Larger source-library browsing may later need pagination, better grouping, or a dedicated source-library panel.
- Safe source deletion/removal controls remain future work and must preserve canon safety.

### UI polish

- Editorial Intake / Review Queue status and type colored tags remain future UI polish.
- Avoid further Review Queue micro-polish unless a concrete issue appears.

- Continue real document dump/import preparation.
- Before using real story files, create a full database backup/snapshot.
- Build or refine extraction/review flows only after the intake/review UI is stable enough to inspect confidently.
- Preserve soft-merge review for uncertain duplicates.
- Flag contradictions for manual review rather than auto-mutating canon.
- Continue Dashboard/editorial home improvements after ingestion stabilization, not during Phase 43 unless explicitly scoped.

## Guardrails

- No canon mutation during staging/intake phases.
- No automatic duplicate merge.
- No automatic contradiction resolution.
- Preserve provenance.
- Prefer manual review boundaries.
- Keep phases small and testable.
- Avoid enterprise/admin UI styling.
- Keep editorial language calm and understandable.
