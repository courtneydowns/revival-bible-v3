# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 10 — Session Prep + Prompt Assembly Foundation.

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
- Focused UI and utility files required for lightweight Context Pack session-context assembly
- Focused smoke-test notes under docs/SMOKE_TESTS/ if needed

## Forbidden Files
- AI API integration
- Streaming chat
- Embeddings, vector DB/search, memory orchestration, semantic search
- Large schema rewrites
- Export system
- Broad search refactor
- Broad schema/store/navigation redesigns
- Tag/status changes unless strictly required

## Patch Class
Focused UI addition plus lightweight context assembly utility for Context Packs.

## Acceptance Criteria
- Context Pack detail view has a Generate Session Context action.
- Generated context is structured, readable, and grouped by record/entity type.
- Output includes titles/names, summaries/descriptions, useful tags/status, and lightweight linked-record references where already available.
- Generated output can be copied to clipboard.
- Phase 8 navigation/back behavior, inspector stability, Context Pack persistence, search/tag systems, and existing linking behavior are preserved.
- No AI APIs, streaming chat, embeddings, vector DB/search, memory orchestration, semantic search, large schema rewrites, broad navigation redesign, or broad export system.
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
