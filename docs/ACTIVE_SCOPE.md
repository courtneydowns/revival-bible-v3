# Revival Bible v3 — Active Scope

Rolling current-task file. Keep this short and update it at the start of each phase.

## Current Phase / Task
Phase 14 — AI Connection Testing Foundation.

## Latest Commit
b62b565 Phase 7: Add tag and status management

## Known Passes
- Phase 8 passed.
- Phase 9 context-pack persistence smoke passed.
- Phase 9 context-pack navigation smoke passed.

## Known Failures
- Phase 14 retest failed: Test Connection for OpenAI and Claude / Anthropic reported no handler registered for `config:test-provider-connection`.
- Phase 14 follow-up retest found the same error in a stale duplicate Electron dev window.
- Phase 14 saved-key replacement retest failed: valid provider keys still returned provider 401s after users entered new keys.
- Phase 14 OpenAI retest failed: OpenAI rejected `max_output_tokens: 8` because the Responses API requires at least 16.
- Phase 14 final OpenAI auth retest failed with a generic error that hid the sanitized OpenAI provider response body.
- Phase 14 final OpenAI auth diagnostics found the saved OpenAI credential had an unrecognized prefix family and length 902, so it was not an OpenAI `sk-...` key.

## Latest Fix
- Registered the saved-config provider connection test IPC path on the exact `config:test-provider-connection` channel used by preload and Settings.
- Stopped duplicate `electron-vite dev` process trees and reran one clean dev instance; both providers reached the registered handler and returned provider/API errors instead of IPC handler errors.
- Test Connection now persists the current provider's pending key and model before invoking the saved-config provider test, and saved keys are normalized before storage and use.
- OpenAI Test Connection now requests `max_output_tokens: 16`, keeping the request lightweight while satisfying the API minimum.
- OpenAI Test Connection now reads the provider response body directly, returns the sanitized provider failure reason, and emits development-only sanitized diagnostics for provider, model, key prefix family, key length, status code, and response body.
- OpenAI Test Connection now preflights the saved key prefix and returns a sanitized local error before attempting a request with a non-OpenAI-shaped key.

## Allowed Files
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md after successful verification only
- Focused UI and utility files required for local AI provider settings and connection testing
- Focused smoke-test notes under docs/SMOKE_TESTS/ if needed

## Forbidden Files
- Full AI chat workflow
- Streaming chat
- Embeddings, vector DB/search, memory orchestration, semantic search
- Large schema rewrites
- Export system
- Broad search refactor
- Broad schema/store/navigation redesigns
- Tag/status changes unless strictly required

## Patch Class
Focused additive UI/utility layer for local AI provider connection testing.

## Acceptance Criteria
- AI Settings can test saved OpenAI and Claude / Anthropic provider configuration with lightweight provider-specific requests.
- Test Connection shows idle, loading, success, and readable failure states.
- Duplicate rapid test requests are prevented.
- API keys are never exposed in UI, logs, IPC responses, or errors.
- Provider logic remains separated and extensible.
- Session Context, templates, Copy Full Prompt, search, and inspector/navigation behavior are preserved.
- Phase 8 navigation/back behavior, inspector stability, Context Pack persistence, search/tag systems, and existing linking behavior are preserved.
- No chat UI, screenplay generation, Session Context sending workflow, streaming, embeddings, vector DB/search, memory orchestration, semantic search, large schema rewrites, broad navigation redesign, or broad export system.
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
