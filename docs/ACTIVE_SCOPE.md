# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 15 — Single AI Session Workflow Foundation.

## Latest Commit
b62b565 Phase 7: Add tag and status management

## Known Passes
- Phase 8 passed.
- Phase 9 context-pack persistence smoke passed.
- Phase 9 context-pack navigation smoke passed.
- Phase 15 Electron-runtime smoke passed for OpenAI and Anthropic one-response sessions, local save, reload persistence, and reopen.

## Known Failures
- User-verified failures remain: Template Instructions and prompt/template fields still cannot be edited, generation toast still does not appear, and prior fixes may not be visible in the user runtime.

## Latest Fix
- Added temporary Phase 15 runtime canaries to prove the rendered code path: visible debug banner, isolated local-state DEBUG EDIT TEST textarea with live value echo, and DEBUG SHOW TOAST button using the same global toast path as generation.
- Diagnostic result found the canary textarea and DEBUG SHOW TOAST worked, while the in-composer Template Instructions control still missed the native edit path; Template Instructions is now moved to the same top-level panel pattern as the working canary and wired into prompt assembly.

## Allowed Files
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md after successful verification only
- Focused Electron main/preload, store, and UI files required for one-response AI session creation and local history
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
Focused additive AI session workflow foundation.

## Acceptance Criteria
- User can choose one Session Context source and one Template, add instructions, send one prompt, and receive one provider response.
- OpenAI Responses API and Anthropic Messages API calls stay in Electron main only.
- API keys are never exposed in renderer, UI, logs, IPC responses, or errors.
- Prompt assembly is deterministic and local to the renderer.
- Sessions save provider, model, prompt, response, and timestamps locally.
- Session history persists after reload and prior sessions reopen for viewing.
- Session Context, templates, Copy Full Prompt, search, and inspector/navigation behavior are preserved.
- Phase 8 navigation/back behavior, inspector stability, Context Pack persistence, search/tag systems, and existing linking behavior are preserved.
- No chat UI, screenplay generation, streaming, embeddings, vector DB/search, memory orchestration, semantic search, large schema rewrites, broad navigation redesign, or broad export system.
- Final report is concise and names unresolved blockers.

## Verification
- `npm run build` passed on 2026-05-10.
- Electron/Vite were fully killed and `npm run dev` relaunched on 2026-05-10. Hard-runtime canary smoke passed: visible `PHASE 15 DEBUG CANARY ACTIVE`; DEBUG EDIT TEST accepted `DEBUG CAN TYPE` and live echo updated; DEBUG SHOW TOAST showed the global toast; Template Instructions accepted `USER CAN TYPE HERE` and draft length updated to 227; OpenAI/gpt-4.1 generation and Claude/claude-sonnet-4-6 generation both showed visible top-right global toast and Last toast debug.

## Report Format
- Files changed.
- One sentence per fix.
- Exact smoke result.
- Exact build result.
- Unresolved blockers.
