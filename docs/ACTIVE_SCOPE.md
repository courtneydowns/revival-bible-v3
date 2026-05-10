# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 11 — Session Context Preset + Prompt Template Foundation.

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
- Focused UI and utility files required for lightweight Context Pack session-context and prompt-template assembly
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
Focused additive UI/utility layer for Context Pack session-context prompt templates.

## Acceptance Criteria
- Context Pack detail view keeps Phase 10 Generate Session Context behavior.
- Users can choose plain-text prompt presets: Writing Session, Continuity Check, Character Voice Pass, Episode Planning, Contradiction Review.
- A full assembled prompt includes selected template instructions, generated Session Context, and clear section headings.
- Full assembled prompt can be copied with visible confirmation.
- Session Context output remains visible after navigation, existing copy confirmation still works, and linked Question routing still works.
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
