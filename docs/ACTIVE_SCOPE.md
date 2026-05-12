# Revival Bible v3 — Active Scope

## Current Status

Phase 40 passed.

Phase 40 added safe editorial ingestion staging foundations. Import sessions now support attached staged sources, source counts, provenance metadata, Central Time import timestamps, lightweight TXT/MD previews, placeholder preservation for binary/unsupported sources, and calm source/session browsing without canon mutation.

## Recently Completed Phase

### Phase 40 — Safe Editorial Ingestion Staging Foundations

Status: Passed

Files changed:
- electron/main/db.js
- src/store.js
- src/components/EditorialIngestion.jsx
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Validated:
- npm run build passed.
- Real Electron smoke passed for creating an ingestion session, attaching a TXT source, verifying source preview/provenance, reloading persistence, creating/restoring a snapshot, Dashboard load, autosave stability, unchanged canon counts, and no automatic canon mutation.
- Source records preserve original filename, source type, file size, preview state, provenance note, and Central Time imported metadata.
- TXT/MD files get lightweight persisted previews; PDF/DOC/DOCX/unsupported sources are safely preserved with placeholder metadata.
- Attached sources remain staged/unreviewed source memory only; extraction candidates and canon remain visibly distinct.

No unresolved blockers.

### Phase 39 — Recovery / Snapshot / Rollback Foundations

Status: Passed

### Phase 38 — Editorial Review Workspace Refactor + Provenance Normalization

Status: Passed

Summary:
Phase 38 refactored Editorial Ingestion into a scalable split-pane editorial review workspace and normalized provenance/confidence controls.

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

### Phase 41 — Controlled Extraction Boundary

Goal:
Begin the smallest review-first extraction boundary from staged sources into editorial candidates, using Phase 40 source staging as the preserved source layer.

Strict scope:
- staged source remains distinct from extracted candidate and accepted canon
- extraction remains manual/reviewable unless explicitly authorized
- source provenance must carry forward to every candidate/review item
- use snapshots before unstable import/extraction passes
- no automatic canon mutation
- no automatic duplicate merge
- no automatic contradiction resolution
- no embeddings, vector search, or autonomous organization

## Workflow Reminder

After a phase smoke test passes:
1. Generate git commit/push commands.
2. Generate/update relevant project-control docs as separate downloadable files.
3. Generate the next-phase ChatGPT copy/paste prompt.
