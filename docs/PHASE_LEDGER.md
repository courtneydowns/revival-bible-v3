# Revival Bible v3 — Phase Ledger

## Phase 40 — Safe Editorial Ingestion Staging Foundations

Status: Passed

Completion summary:
Phase 40 added a safe staged-source layer inside Editorial Ingestion before real extraction work begins.

Files changed:
- electron/main/db.js
- src/store.js
- src/components/EditorialIngestion.jsx
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
The ingestion workspace needed recoverable, provenance-aware source attachment before any extraction pipeline could safely begin.

One sentence fix:
Added session-attached staged sources with original filename metadata, source-type labels, Central Time import provenance, lightweight TXT/MD previews, binary placeholders, compact session source lists, and clear non-canon boundaries.

Build result:
npm run build passed.

Smoke result:
Real Electron smoke passed; ingestion session creation, TXT source attachment, preview/provenance visibility, reload persistence, snapshot creation, snapshot restore, Dashboard load, autosave stability, unchanged canon counts, and no automatic canon mutation were verified.

Unresolved blockers:
None.

## Phase 39 — Recovery / Snapshot / Rollback Foundations

Status: Passed

Completion summary:
Phase 39 added a lightweight local recovery layer before real import/extraction work begins.

Files changed:
- electron/main/db.js
- electron/main/index.js
- electron/preload/index.js
- src/components/SettingsModal.jsx
- src/store.js
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
The protected ingestion framework needed a local, user-authoritative recovery foundation before unstable extraction/import sessions could safely begin.

One sentence fix:
Added manual SQLite snapshots, a calm Settings recovery UI, confirmed restore with pre-restore safety backup, Central Time metadata, record counts, and concise recovery roadmap hooks without changing canon mutation paths.

Build result:
npm run build passed.

Smoke result:
Real Electron smoke passed; manual snapshot creation, recovery UI listing, Central Time timestamp formatting, harmless test edit, confirmed restore, pre-restore backup creation, Dashboard load, autosave/status stability, unchanged canon counts at 25/8/16/49, and no automatic canon mutation were verified.

Unresolved blockers:
None.

## Phase 38 — Editorial Review Workspace Refactor + Provenance Normalization

Status: Passed

Completion summary:
Phase 38 refactored Editorial Ingestion into a scalable split-pane editorial review workspace and normalized provenance/confidence controls for archival review.

Files changed:
- electron/main/db.js
- src/components/EditorialIngestion.jsx
- src/store.js
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
The ingestion review surface had outgrown a compact rail/card layout and source/confidence inputs were too freeform for long-term editorial review.

One sentence fix:
Added a queue/detail review workspace with explicit exit controls, readable provenance inspection, normalized source presets, optional custom labels, and controlled confidence definitions while preserving review-only routing.

Build result:
npm run build passed.

Smoke result:
Electron smoke passed; Editorial Ingestion opened, split-pane review selection and detail inspection worked, close/back/Escape cleared selection, source presets and custom labels worked, confidence presets worked, Dashboard queues remained visible, autosave stayed stable, and canon counts remained unchanged.

Unresolved blockers:
None.

## Phase 37 — Manual Ingestion Retest + ZIP/Document Import Planning Gate

Status: Passed

Completion summary:
Phase 37 re-smoked and hardened the real Editorial Ingestion workflow before any ZIP/document extraction work begins.

Files changed:
- electron/main/db.js
- src/components/EditorialIngestion.jsx
- src/store.js
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
The manual ingestion UI worked, but provenance-required behavior and source metadata persistence needed backend hardening before real document import planning could proceed.

One sentence fix:
Required provenance at the persistence boundary, captured explicit source provenance notes for staged material, preserved review-only routing, and documented the ZIP/document import safety gate.

Build result:
npm run build passed.

Smoke result:
Real Electron smoke passed; manual import session creation, provenance enforcement, source metadata persistence, extraction candidate persistence, duplicate routing, contradiction routing, weak-confidence review, narrative fragment preservation, Dashboard queue updates, navigation/reload persistence, autosave/status stability, Central Time timestamps, and unchanged canon counts at 8/25/16/49 were verified.

Unresolved blockers:
None.

ZIP/document import gate:
- Raw source memory must be preserved before extraction.
- Provenance is mandatory and permanent across sessions, sources, extractions, duplicate reviews, continuity reviews, and fragments.
- Duplicate uncertainty remains soft-merge review only.
- Contradictions remain manual continuity review only.
- Weak-confidence material and narrative fragments remain non-canon review material.
- Extraction sessions must be auditable, batchable, and recoverable.
- Rollback/recovery must avoid canon mutation.
- Pre-canon editorial review and explicit user promotion are required.

## Phase 36 — Minimal Safe Editorial Ingestion Surface

Status: Passed

Completion summary:
Phase 36 exposed a calm manual Editorial Ingestion workspace for safe staging/testing before real ZIP/document ingestion.

Files changed:
- src/components/EditorialIngestion.jsx
- src/components/AppShell.jsx
- src/components/NavRail.jsx
- src/store.js
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
The protected ingestion/review architecture existed internally, but there was no safe real-UI surface for manual editorial import/extraction testing.

One sentence fix:
Added a provenance-required manual staging workspace that creates import sessions, source memory, reviewable extraction candidates, duplicate reviews, continuity reviews, and narrative fragments without canon mutation.

Build result:
npm run build passed.

Smoke result:
Electron dev launch passed; real Electron UI smoke created a manual import session, staged fake extraction material, verified provenance persistence, duplicate routing, contradiction routing, weak-confidence surfacing, narrative fragment non-canon preservation, Dashboard queue updates, autosave/status stability, Central Time timestamps, and unchanged canon counts.

Unresolved blockers:
None.

## Phase 35 — Import / Extraction Workflow Smoke + ZIP/Document Readiness Pass

Status: Passed

Completion summary:
Phase 35 validated the protected ingestion framework with a temp DB import/extraction smoke and added Dashboard review detail routing for source, duplicate, continuity, weak-confidence, and narrative-fragment review items.

Files changed:
- src/components/Dashboard.jsx
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
Phase 33 ingestion records surfaced in Dashboard queues, but Dashboard review items did not open into a stable detail surface showing provenance/source state.

One sentence fix:
Added a contained Dashboard review detail surface and routed import/extraction review queues into it while preserving review-only, non-canon behavior.

Build result:
npm run build passed.

Smoke result:
Electron dev launch passed; temp DB smoke verified safe import/session creation, source memory, extraction persistence, duplicate review, contradiction review, weak-confidence reviewability, narrative fragment preservation, visible source/provenance linkage, unchanged canon counts, timestamps, and review queue updates.

Unresolved blockers:
None.

## Phase 34 — Dashboard / Editorial Home Structural UX Pass

Status: Passed

Completion summary:
Phase 34 reworked the Dashboard from a long vertical stack into a contained editorial home workspace.

Files changed:
- src/components/Dashboard.jsx
- src/index.css
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md

Root cause:
Phase 33 added real review surfaces, but the Dashboard still presented them in a vertically sprawling page structure.

One sentence fix:
Created a two-column Dashboard with a primary Continue Working area, contained Recent Editorial Activity, and an Editorial Focus column with compact review queues.

Build result:
npm run build passed.

Smoke result:
Electron dev launch passed; manual Dashboard smoke verified reduced long-scroll sprawl, visible Phase 33 review surfaces, Central Time timestamps, no internal phase labels in primary UI, stable Dashboard routing actions, and stable autosave/status display.

Unresolved blockers:
None.

## Phase 33 — Editorial Ingestion / Continuity Protection Framework

Status: Passed

Completion summary:
Phase 33 added ingestion protection architecture before large-scale extraction or seeding.

Files changed:
- electron/main/db.js
- electron/main/schema.js
- electron/main/index.js
- electron/preload/index.js
- src/store.js
- src/components/Dashboard.jsx
- phase docs

Root cause:
Phase 33 needed ingestion protection architecture before extraction/seeding.

One sentence fix:
Added import sessions, source memory, editorial extractions, duplicate review, continuity review, narrative fragments, IPC/preload/store plumbing, and dashboard surfacing without canon mutation.

Build result:
npm run build passed.

Smoke result:
Electron dev launch passed; transactional SQLite smoke verified duplicate review, contradiction routing, provenance records, continuity review creation, narrative fragment creation, and unchanged canon counts.

Unresolved blockers:
None.

## Next Planned Phase

### Phase 41 — Controlled Extraction Boundary

Status: Planned

Reason:
Staged sources are now preserved safely with provenance and recovery compatibility, so the next step can introduce a narrow extraction boundary into reviewable editorial candidates.

Goal:
Extract only from staged sources into reviewable, provenance-linked candidates while preserving duplicate review, continuity review, recovery expectations, and explicit canon promotion.
