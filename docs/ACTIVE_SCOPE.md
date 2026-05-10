# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 16A — Navigation + workspace width polish.

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
- Phase 15 passed: AI Sessions can generate OpenAI and Claude one-response sessions, edit Template Instructions, persist history, and show inline success feedback.

## Allowed Files
- docs/ACTIVE_SCOPE.md
- Focused UI, store, and CSS files required for navigation collapse, workspace width, AI Sessions history collapse, and Phase 16A workflow polish
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
Focused UI polish for navigation width and AI Sessions workflow ergonomics.

## Acceptance Criteria
- Left navigation supports expanded and compact/icon-only modes and remembers the state locally.
- AI Sessions, Story Bible, and Living Documents gain more usable width.
- AI Sessions history supports expanded, compact, and collapsed modes.
- AI Sessions response area is the primary visual focus, with calmer spacing and reduced scroll pressure.
- Additional Instructions clears when provider or model changes.
- Inline generation success feedback remains near Generate.
- OpenAI/gpt-4.1 and Claude/claude-sonnet-4-6 generation still work.
- Context Packs still opens normally.

## Verification
- Pending Phase 16A verification.

## Report Format
- Files changed.
- One sentence per fix.
- Exact smoke result.
- Exact build result.
- Unresolved blockers.
