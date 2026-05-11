# Revival Bible v3 — Roadmap

## Product North Star

Revival Bible v3 is a continuity-aware editorial operating system and permanent creative memory system for long-form narrative development.

Core value:
- creative memory retrieval
- editorial continuity confidence
- canon traceability
- provenance preservation
- safe review workflows

The system should help the user remember, compare, review, and intentionally promote story material. It must not autonomously rewrite canon, merge uncertain duplicates, resolve contradictions, or flatten ambiguity.

## Completed Recent Phases

### Phase 33 — Editorial Ingestion / Continuity Protection Framework

Status: Passed

Summary:
Added the framework for safe ingestion before large-scale document extraction or seeding.

Delivered:
- import session architecture
- source memory structures
- editorial extraction structures
- duplicate review groundwork
- soft-merge review groundwork
- contradiction/continuity review routing
- provenance persistence
- narrative fragment groundwork
- Dashboard surfacing groundwork
- IPC/preload/store plumbing
- no automatic canon mutation

Validation:
- npm run build passed
- Electron dev launch passed
- transactional SQLite smoke passed
- duplicate review, contradiction routing, provenance records, continuity review creation, narrative fragment creation, and unchanged canon counts verified

## Next Priority Phase

### Phase 34 — Dashboard / Editorial Home Structural UX Pass

Goal:
Fix the Dashboard long-scroll issue and turn the Dashboard into a calmer, more structured editorial home workspace.

Why now:
Phase 33 created the ingestion/review structures the Dashboard needs to surface. The layout should now be reworked around real editorial-review concepts instead of stacking more sections into a long scrolling page.

Primary objectives:
- reduce the long-scrolling single-window feel
- create contained, readable editorial workspace regions
- improve Continue Working hierarchy
- improve Editorial Focus hierarchy
- surface review queues without clutter
- support duplicate review, continuity review, unresolved extraction, weak-confidence material, narrative fragments, pending placement, and unresolved editorial risks
- use calm, document-oriented UI patterns
- preserve Central Time timestamps
- preserve autosave expectations
- preserve routing/history behavior
- avoid visible internal phase labels in primary UI

Strict non-goals:
- no new ingestion architecture
- no bulk extraction/import
- no automatic canon mutation
- no auto-merge
- no auto-resolution of contradictions
- no screenplay-authoring systems
- no enterprise dashboard styling
- no fake productivity metrics

Acceptance expectations:
- Dashboard no longer feels like one long scroll window.
- Main editorial surfaces are scannable without excessive vertical wandering.
- Continue Working and Editorial Focus feel primary.
- Review queues are visible but calm.
- No internal build phase labels appear in primary UI.
- npm run build passes.
- Manual Electron smoke passes.

## Future Priorities

### Large-Scale Source Import / Extraction

After the ingestion framework and Dashboard structural UX stabilize, begin controlled document-dump import and extraction workflows.

Rules:
- preserve raw source memory
- extract into reviewable editorial memory first
- do not create duplicate canon records automatically
- route contradictions into review
- route uncertain duplicates into soft-merge review
- preserve provenance permanently
- require explicit user promotion for canon

### Soft Merge Review Expansion

Future soft-merge work should support:
- possible duplicate linking
- match confidence and reason display
- confirm merge
- reject merge
- review later
- provenance preservation
- no destructive replacement

### Continuity Review Expansion

Future continuity review should support:
- conflicting claim comparison
- source-by-source provenance
- manual resolution states
- links to affected canon/editorial/source memory
- Dashboard surfacing

### Narrative Fragments / Story Material

Future narrative fragments should support unresolved or partial creative memory without becoming screenplay drafting tools.

These may include:
- scene fragments
- story material
- abandoned concepts
- rewrite leftovers
- unresolved plot ideas
- tone/voice/context notes

Slugline remains responsible for screenplay authoring and screenplay formatting.
