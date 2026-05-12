# Revival Bible v3 — Active Scope

## Current Status

Phase 38 passed.

Phase 38 refactored Editorial Ingestion into a scalable split-pane editorial review workspace. Review items now open from a persistent queue into a roomy detail pane with provenance, raw excerpts, editorial notes, continuity context, duplicate context, explicit close/back navigation, and Escape-to-close behavior. Source typing now uses controlled archival presets with optional custom labels, and confidence now uses normalized editorial definitions: Confirmed, Strong, Moderate, Weak, and Speculative.

## Recently Completed Phase

### Phase 38 — Editorial Review Workspace Refactor + Provenance Normalization

Status: Passed

Files changed:
- src/components/EditorialIngestion.jsx
- src/store.js
- electron/main/db.js
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Validated:
- npm run build passed.
- Editorial Ingestion now uses an intake column plus split-pane review workspace.
- Review queue selection, detail inspection, back/close controls, and Escape-to-close behavior were added.
- Provenance, raw source excerpts, review material, continuity context, duplicate context, and editorial notes are readable in the detail pane.
- Source type presets are normalized while optional custom source labels remain preserved in provenance metadata.
- Confidence presets are normalized to editorial definitions without automatic canon promotion.
- Existing review routing, Dashboard queues, autosave behavior, and canon safety rules remain intact.

No unresolved blockers.

### Phase 37 — Manual Ingestion Retest + ZIP/Document Import Planning Gate

Status: Passed

Files changed:
- src/components/EditorialIngestion.jsx
- src/store.js
- electron/main/db.js
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Validated:
- npm run build passed.
- Real Electron smoke passed.
- Manual import session creation persisted.
- Provenance-required enforcement was validated and hardened.
- Source metadata and extraction candidates persisted after navigation and reload.
- Duplicate uncertainty routed to duplicate review.
- Contradictions routed to continuity review.
- Weak-confidence material surfaced in review.
- Narrative fragments remained non-canon.
- Dashboard queues updated.
- Autosave/status and Central Time timestamps remained stable.
- Canon counts remained unchanged at 8/25/16/49.

Import safety gate:
- ZIP/document extraction must preserve raw source records before any extraction.
- Every session, source, candidate, duplicate review, continuity review, and fragment must carry permanent provenance.
- Duplicate uncertainty must create soft-merge review only.
- Contradictions must create manual continuity review only.
- Weak-confidence and soft-merge material must remain reviewable before promotion.
- Narrative fragments must remain non-canon editorial memory.
- Extraction sessions must be auditable, batchable, and recoverable.
- Rollback/recovery must preserve source memory and avoid partial canon mutation.
- Pre-canon editorial review is mandatory; the user remains authoritative.

No unresolved blockers.

### Phase 36 — Minimal Safe Editorial Ingestion Surface

Status: Passed

Files changed:
- src/components/EditorialIngestion.jsx
- src/components/AppShell.jsx
- src/components/NavRail.jsx
- src/store.js
- src/index.css
- phase docs

Validated:
- npm run build passed.
- Electron dev launch passed.
- Manual UI smoke created an import session through the real Electron UI.
- Fake extraction candidates persisted with provenance.
- Duplicate uncertainty routed into duplicate review.
- Contradiction routed into continuity review.
- Weak-confidence material surfaced in review queues.
- Narrative fragment remained non-canon.
- Canon counts remained unchanged.
- Dashboard queues updated and routed staged items.
- Autosave/status and Central Time timestamps remained stable.

No unresolved blockers.

### Phase 35 — Import / Extraction Workflow Smoke + ZIP/Document Readiness Pass

Status: Passed

Files changed:
- src/components/Dashboard.jsx
- src/index.css
- phase docs

Validated:
- npm run build passed.
- Electron dev launch passed.
- Temp DB import/extraction smoke created a safe import session, source records, overlapping weak/contradictory extractions, duplicate review, continuity review, and narrative fragment records.
- Duplicate uncertainty remained review-only and did not create canon duplicates.
- Contradictions routed to continuity review instead of mutating canon.
- Weak-confidence material and narrative fragments remained reviewable and non-canon.
- Source/provenance linkage remained visible.
- Dashboard source, continuity, and confidence queues update and route into review detail.
- Canon counts remained unchanged.
- Central Time timestamps, absence of primary UI phase labels, and autosave/status display remained stable.

No unresolved blockers.

### Phase 34 — Dashboard / Editorial Home Structural UX Pass

Status: Passed

Summary:
Phase 34 reworked the Dashboard / Editorial Home into a calmer contained continuation workspace.

### Phase 33 — Editorial Ingestion / Continuity Protection Framework

Status: Passed

Files changed:
- electron/main/db.js
- electron/main/schema.js
- electron/main/index.js
- electron/preload/index.js
- src/store.js
- src/components/Dashboard.jsx
- phase docs

Validated:
- npm run build passed.
- Electron dev launch passed.
- Transactional SQLite smoke verified duplicate review behavior.
- Contradiction routing verified.
- Provenance records verified.
- Continuity review creation verified.
- Narrative fragment creation verified.
- Canon counts remained unchanged.

No unresolved blockers.

## Active Architectural Rules

- Imported material must never become canon automatically.
- Source material must remain preserved and searchable.
- Provenance is mandatory and permanent.
- Contradictions must route into manual continuity review.
- Duplicate uncertainty must use soft-merge review rather than automatic merge.
- AI may assist extraction and organization but must not autonomously mutate canon.
- Repeated mentions do not equal canon truth.
- Narrative ambiguity should be preserved where appropriate.
- Canon Memory contains explicitly promoted material only.

## Approved Memory Model

### Source Memory

Immutable or preserved material, including:
- raw imports
- AI exports
- notes
- rewrite batches
- abandoned concepts
- source archives

### Editorial Memory

Reviewable and unresolved material, including:
- candidates
- unresolved questions
- continuity risks
- narrative fragments
- extracted material
- duplicate review items
- contradiction/continuity review items

### Canon Memory

Explicitly promoted material only.

## Next Recommended Phase

### Phase 39 — Controlled ZIP / Document Import Entry Point

Goal:
Add the smallest safe user-facing ZIP/document import entry point using the protected ingestion framework, Dashboard queues, Phase 37 import safety gate, and Phase 38 split-pane editorial review workspace.

Strict scope:
- narrow controlled import entry point only
- source preservation and provenance capture before extraction
- extraction-session audit trail
- import batching with rollback/recovery expectations
- no automatic canon mutation
- no automatic duplicate merge
- no automatic contradiction resolution
- no screenplay authoring features

## Workflow Reminder

After a phase smoke test passes:
1. Generate git commit/push commands.
2. Generate/update relevant project-control docs as separate downloadable files.
3. Generate the next-phase ChatGPT copy/paste prompt.
