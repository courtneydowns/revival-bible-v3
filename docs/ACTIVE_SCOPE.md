# Revival Bible v3 — Active Scope

## Current Status

Phase 36 passed.

Phase 36 exposed a minimal safe Editorial Ingestion workspace for manual staging/testing before real ZIP/document ingestion. The workflow creates manual import sessions, requires provenance, stages source memory and extraction candidates, routes duplicate uncertainty and contradictions into existing review queues, preserves narrative fragments as non-canon, and leaves canon counts unchanged.

## Recently Completed Phase

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

### Phase 37 — Controlled ZIP / Document Import Entry Point

Goal:
Add the smallest safe user-facing ZIP/document import entry point using the Phase 33 protection framework, Phase 34 Dashboard home, and Phase 35 readiness validation.

Strict scope:
- narrow controlled import entry point only
- no automatic canon mutation
- no automatic duplicate merge
- no automatic contradiction resolution
- no screenplay authoring features

## Workflow Reminder

After a phase smoke test passes:
1. Generate git commit/push commands.
2. Generate/update relevant project-control docs as separate downloadable files.
3. Generate the next-phase ChatGPT copy/paste prompt.
