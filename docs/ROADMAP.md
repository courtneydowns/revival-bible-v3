# Revival Bible v3 — ROADMAP

Last updated: 2026-05-12 CDT

## Current roadmap position

The project has completed the Phase 42 source/session/review safety work far enough to move out of repeated `Phase 42C-fixX` loops and into a dedicated stabilization cluster.

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

## Next major cluster

# Phase 43 — Editorial Ingestion Workflow Stabilization

Purpose:

Phase 43 is a UX stabilization cluster for Editorial Ingestion after the safe intake/review architecture is in place. It should stop the repeated micro-fix cycle and address the remaining review workflow comprehension, list readability, overflow, scroll, and action clarity problems in focused subphases.

This is not extraction automation and not canon import.

## Phase 43 proposed subphases

### Phase 43A — Review List readability + card hierarchy

Make staged review items readable, scannable, and clearly connected to the review workflow.

Targets:
- review card hierarchy
- row/card spacing
- checkbox alignment
- title/source/type/status readability
- row-level newly staged marker
- selected item state
- truncation rules
- density reduction

### Phase 43B — Tag/chip wrapping and overflow behavior

Fix badge/chip layout in Review Workspace/List.

Targets:
- no overlapping tags
- chips wrap cleanly
- chips do not cover titles/statuses
- chips work in normal Electron window sizes
- latest-staged and review-row badges remain readable

### Phase 43C — Review List scroll/clipping/responsive stability

Make the Review List inspectable across normal app sizes.

Targets:
- scroll containers
- clipping issues
- fixed-height layout conflicts
- responsive right-column behavior
- list remains reachable after staging

### Phase 43D — Intake workflow simplification / source-first flow

Make source attachment the obvious first action and session metadata supportive rather than blocking.

Targets:
- source-first UI copy
- session details editable/collapsible
- auto-created sessions clearly explained
- avoid one long stacked intake form

### Phase 43E — Editorial action clarity

Make it clear what to do after staging.

Targets:
- Accept / Defer / Placement wording
- action enable/disable clarity
- next-step copy
- empty/success/error states
- canon-safety reassurance

## Later roadmap items after Phase 43

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
