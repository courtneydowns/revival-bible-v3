# Revival Bible v3 — Active Scope

## Current Status

Phase 34 passed.

Phase 34 reworked the Dashboard / Editorial Home into a calmer contained continuation workspace. Continue Working is now a stable primary region, Editorial Focus is a separate review column with compact contained queues, and the Dashboard no longer relies on a single long vertical stack.

## Recently Completed Phase

### Phase 34 — Dashboard / Editorial Home Structural UX Pass

Status: Passed

Files changed:
- src/components/Dashboard.jsx
- src/index.css
- phase docs

Validated:
- npm run build passed.
- Electron dev launch passed.
- Dashboard smoke confirmed a two-column contained editorial home with Continue Working, Recent Editorial Activity, and Editorial Focus visible without long-page sprawl.
- Phase 33 review structures remain surfaced through duplicate review, continuity review, unresolved extraction, narrative fragment, weak-confidence, pending-placement, and editorial-risk queues.
- Central Time timestamps remain visible.
- No internal phase labels appear in primary Dashboard UI.
- Dashboard navigation actions and autosave/status display remained stable in smoke.

No unresolved blockers.

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

### Phase 35 — Controlled Source Import / Extraction Planning

Goal:
Define the smallest safe next step for controlled source import or extraction using the Phase 33 protection framework and Phase 34 Dashboard review home.

Strict scope:
- planning and narrow workflow definition only unless explicitly approved
- no automatic canon mutation
- no automatic duplicate merge
- no automatic contradiction resolution
- no screenplay authoring features

## Workflow Reminder

After a phase smoke test passes:
1. Generate git commit/push commands.
2. Generate/update relevant project-control docs as separate downloadable files.
3. Generate the next-phase ChatGPT copy/paste prompt.
