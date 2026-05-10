# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 16B — Session Context / Context Packs workflow polish.

## Latest Commit
b62b565 Phase 7: Add tag and status management

## Known Passes
- Phase 8 passed.
- Phase 9 context-pack persistence smoke passed.
- Phase 9 context-pack navigation smoke passed.
- Phase 15 Electron-runtime smoke passed for OpenAI and Anthropic one-response sessions, local save, reload persistence, and reopen.

## Known Failures
- None for Phase 16A before implementation.

## Latest Fix
- Phase 16A passed: AI Sessions workflow is usable, collapsible nav works, compact nav tooltips work, OpenAI and Claude generation work, and Context Packs still opens.

## Allowed Files
- docs/ACTIVE_SCOPE.md
- Focused UI and CSS files required for Context Packs / Session Context editability and inline generation feedback
- Focused smoke-test notes under docs/SMOKE_TESTS/ if needed

## Forbidden Files
- Agents or autonomous workflows
- Streaming chat
- Embeddings, vector DB/search, memory orchestration, semantic search
- Provider routing, tool calling, or function calling
- Large schema rewrites
- Export system
- Broad search refactor
- Broad schema/store/navigation redesigns
- Tag/status changes unless strictly required

## Patch Class
Focused UI polish for Context Packs / Session Context workflow ergonomics.

## Acceptance Criteria
- Context Packs opens normally.
- Generate Session Context shows inline success feedback near the generate control.
- Generated session context text can be edited before copy.
- Prompt template instructions can be edited for the current generated prompt where appropriate.
- Generated full prompt text can be edited before copy.
- Copy Full Prompt copies edited prompt text.
- Context Pack save/delete behavior remains intact.
- AI Sessions still opens and remains distinct from Context Packs / Session Context.
- OpenAI/gpt-4.1 and Claude/claude-sonnet-4-6 generation still work.
- Compact nav still works.
- Context Packs still opens normally.

## Verification
- Pending Phase 16B verification.

## Report Format
- Files changed.
- One sentence per fix.
- Exact smoke result.
- Exact build result.
- Unresolved blockers.
