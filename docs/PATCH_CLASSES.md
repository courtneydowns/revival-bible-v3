# Revival Bible v3 — Patch Classes

Use the active patch class to keep changes small and predictable.

## UI_SCROLL
- Allowed: Scroll restoration, detail scroll reset, viewport visibility checks, focused layout adjustments.
- Forbidden: Search indexing, persistence, schema migrations, large store rewrites.
- Expected scope: 1-3 UI files plus a focused smoke test note if needed.

## SEARCH_ROUTING
- Allowed: Search result click routing, result labeling, navigation state handoff from search.
- Forbidden: Persistence, schema migrations, unrelated UI redesigns, broad data reshaping.
- Expected scope: 1-4 files around search UI/routing only.

## PERSISTENCE
- Allowed: Small save/load fixes, targeted data durability checks, minimal preload/main-process bridge changes.
- Forbidden: Destructive migrations, broad schema rewrites, large store rewrites unless explicitly approved.
- Expected scope: 1-4 files with exact regression verification.

## INSPECTOR_STATE
- Allowed: Inspector selection, detail rendering state, panel open/close behavior, linked-record preview state.
- Forbidden: Search indexing, persistence, schema migrations, unrelated navigation redesigns.
- Expected scope: 1-3 UI files.

## RELATIONSHIP_RENDER
- Allowed: Character relationship display, relationship labels, linked entity rendering, empty states.
- Forbidden: Persistence, schema migrations, search indexing, unrelated character workspace rewrites.
- Expected scope: 1-3 relationship or character UI files.

## TAG_STATUS_EDITING
- Allowed: Tag/status controls, validation, display labels, local edit state, focused save behavior.
- Forbidden: Schema migrations, search indexing changes, broad persistence changes unless explicitly allowed.
- Expected scope: 1-4 files around tag/status editing and display.

## PROMOTION_TRACEABILITY
- Allowed: Candidate ↔ canon linking, provenance metadata rows, source-session traceability, subtle editorial navigation.
- Forbidden: Auto-merging, automatic canon mutation, relationship inference, broad workspace redesigns.
- Expected scope: 1-5 focused provenance or editorial workflow files.

## ROADMAP_DOCS
- Allowed: Updates to docs/ROADMAP.md, concise references in PHASE_LEDGER/CURRENT_STATE/ACTIVE_SCOPE.
- Forbidden: Moving speculative roadmap content into ACTIVE_SCOPE, bloating CURRENT_STATE, or implying future phases are already implemented.
- Expected scope: docs-only.

## OUTPUT_CONTROL
- Codex prompts must avoid narrating commands or dumping repeated terminal output.
- Final reports should remain concise:
  - Files changed
  - Root cause
  - One sentence fix
  - Build result
  - Smoke result
