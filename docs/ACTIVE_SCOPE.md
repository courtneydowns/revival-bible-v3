# Revival Bible v3 — Active Scope

## Current Status

Phase 33 passed.

Phase 33 established the Editorial Ingestion / Continuity Protection Framework before any large-scale document extraction or seeding. The app now has foundational structures for import sessions, source memory, editorial extractions, duplicate review, continuity review, contradiction routing, narrative fragments, provenance preservation, IPC/preload/store plumbing, and Dashboard surfacing groundwork without automatic canon mutation.

## Recently Completed Phase

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

### Phase 34 — Dashboard / Editorial Home Structural UX Pass

Goal:
Rework the Dashboard / Editorial Home so it no longer feels like one long scrolling window.

Rationale:
Phase 33 created the ingestion/review structures the Dashboard must eventually surface. The next phase should organize those structures into a calmer, more usable editorial home rather than continuing to stack more content vertically.

Primary targets:
- reduce long-scroll dashboard sprawl
- create calmer contained workspace regions
- improve Continue Working and Editorial Focus hierarchy
- surface ingestion/review work without enterprise-dashboard styling
- support review queues such as duplicate review, continuity review, unresolved extraction, weak-confidence material, narrative fragment review, pending placement, and unresolved editorial risks
- avoid visible internal phase labels in primary UI
- preserve Central Time timestamps
- preserve autosave/routing/history expectations

Strict scope:
- Dashboard structure and layout only
- no new ingestion architecture
- no canon mutation
- no bulk import
- no screenplay authoring features
- no fake productivity metrics

## Workflow Reminder

After a phase smoke test passes:
1. Generate git commit/push commands.
2. Generate/update relevant project-control docs as separate downloadable files.
3. Generate the next-phase ChatGPT copy/paste prompt.
