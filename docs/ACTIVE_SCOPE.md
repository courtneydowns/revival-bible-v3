# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 9 — AI Context Pack Foundation.

## Latest Commit
b62b565 Phase 7: Add tag and status management

## Known Passes
- Phase 8 passed.
- Phase 9 context-pack persistence smoke passed.
- Phase 9 context-pack navigation smoke passed.

## Known Failures
- None currently recorded.

## Allowed Files
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md after successful verification only
- Focused UI, store, schema, persistence, preload/main bridge, and seed files required for Context Packs
- Focused smoke-test notes under docs/SMOKE_TESTS/ if needed

## Forbidden Files
- AI API integration
- Prompt generation
- Export system
- Broad search refactor
- Broad schema/store/navigation redesigns
- Tag/status changes unless strictly required

## Patch Class
PERSISTENCE plus focused UI addition for Context Packs.

## Acceptance Criteria
- Context Packs workspace/nav entry exists.
- User can create, rename/edit, delete, and persist context packs locally.
- User can add/remove linked existing records and view included records grouped by type.
- Notes/purpose field is editable and persisted.
- Linked records open from a pack and return safely via existing back behavior.
- No AI API, prompt generation, export, broad search, broad schema, inspector, navigation, or tag/status redesign.
- Final report is concise and names unresolved blockers.

## Verification
- Run the smoke test named by the active task.
- Run npm run build when code or workflow acceptance requires it.
- Do not claim PASS without the exact command or manual route that passed.

## Report Format
- Files changed.
- One sentence per fix.
- Exact smoke result.
- Exact build result.
- Unresolved blockers.
