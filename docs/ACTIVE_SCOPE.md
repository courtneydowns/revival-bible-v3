# ACTIVE_SCOPE.md — Revival Bible v3

## CURRENT MICRO-PHASE

Phase 42A-fix3

Goal:
Fix the visible Attach Source button failure in the real Electron Editorial Ingestion UI.

This is a surgical diagnostic micro-phase.
Do not broaden scope.

---

## ACTIVE FAILURE

The visible gold “Attach Source” button inside the Staged Source card currently does nothing in the real Electron app.

Observed:
- no file picker opens
- no source attaches
- no error appears
- no success feedback appears

Previous smoke claims were insufficient because they did not validate the exact visible button path used by the user.

---

## ALLOWED FILES

Primary:
- src/components/EditorialIngestion.jsx
- src/store.js

Allowed ONLY if required:
- electron/preload/index.js
- electron/main/index.js
- src/index.css

---

## FORBIDDEN AREAS

Do NOT touch:
- Dashboard
- footer/database path cleanup
- canon logic
- review-state architecture
- ingestion redesign
- Dashboard layout polish
- future Phase 42D intake restructuring

Do NOT:
- opportunistically refactor
- expand scope
- redesign Editorial Ingestion
- claim pass without real Electron validation

---

## ACCEPTANCE CRITERIA

Required:
- visible gold Attach Source button opens native file picker
- TXT file attaches immediately
- staged source appears instantly
- calm success feedback appears
- cancel creates no junk source
- reload preserves source
- autosave stable
- no console errors
- canon counts unchanged

Secondary:
- Import Session and Staged Source cards remain visually separated
- no overlap/clipping in the left column

Expected canon counts:
25 / 8 / 16 / 49

---

## VALIDATION RULES

REAL ELECTRON SMOKE IS REQUIRED.

Renderer-only validation is NOT sufficient.

Codex must test:
the exact visible gold Attach Source button shown in the user screenshots.

Required smoke:
1. Launch Electron app
2. Open Editorial Ingestion
3. Create/select ingestion session
4. Click visible gold Attach Source button
5. Confirm native picker opens
6. Select TXT file
7. Confirm staged source appears immediately
8. Confirm success feedback appears
9. Click Attach Source again
10. Cancel picker
11. Confirm no junk source created
12. Reload Electron
13. Confirm source persists
14. Confirm autosave stable
15. Confirm canon counts unchanged

---

## WORKFLOW RULES

This repo now uses:
- major phases for architecture/workflow
- micro-phases for regression/debug/polish

Examples:
- Phase 42 = extraction triage architecture
- Phase 42A = attachment/control fixes
- Phase 42B = footer cleanup
- Phase 42C = Dashboard overflow fix
- Phase 42D = future intake-flow restructuring

Micro-phases must remain:
- surgical
- token-efficient
- minimal-file-touch
- narrow in scope
