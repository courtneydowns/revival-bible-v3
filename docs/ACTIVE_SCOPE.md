# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

Use docs/ROADMAP.md for future phase planning.
Use docs/PHASE_LEDGER.md for completed/pending phase status.
Use docs/CURRENT_STATE.md for stable completed architecture.

## Current Phase / Task
Phase 25 — Promotion Coverage + Real-State Validation.

## Latest Commit
Add promotion traceability and restore nav scrolling

## Known Passes
- Phase 19 passed.
- Phase 20 passed.
- Phase 21 passed.
- Phase 22 passed.
- Phase 23 passed.
- Phase 24 passed.
- Candidate promotion foundation stable.
- Provenance backlinking stable.
- Compact/expanded nav scrolling restored.
- OpenAI generation works.
- Claude / Anthropic generation works.

## Known Failures
- None currently confirmed.

## Latest Fix
- Phase 24 added canon provenance rows, candidate ↔ canon linking, source AI Session navigation, and restored compact-nav scrolling/tooltips.

## Allowed Files
- docs/ACTIVE_SCOPE.md
- Focused promotion/provenance UI files
- Focused navigation/UI files required for validation fixes
- Focused smoke-test notes under docs/SMOKE_TESTS/ if needed

## Forbidden Files
- Autonomous workflows
- Embeddings/vector systems
- Automatic canon mutation
- Relationship inference systems
- Broad schema rewrites
- Enterprise dashboards
- Broad navigation redesigns
- Large architectural refactors

## Patch Class
Focused editorial workflow validation and provenance polish.

## Acceptance Criteria
- All promotion destinations open correctly:
  - Character
  - Episode
  - Decision
  - Question
  - Location
  - Story Bible
- Promotion creates canon entities only after explicit confirmation.
- Candidate remains permanently preserved.
- Canon entity shows provenance metadata.
- Candidate ↔ canon navigation works.
- Source AI Session navigation works.
- Nav scrolling/tooltips continue working.
- npm run build passes.

## Verification
- Pending Phase 25 verification.

## Report Format
- Files changed.
- Root cause.
- One sentence fix.
- Build result.
- Smoke result.
