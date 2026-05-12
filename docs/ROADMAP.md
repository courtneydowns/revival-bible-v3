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

### Phase 36 — Minimal Safe Editorial Ingestion Surface

Status: Passed

Summary:
Exposed a calm, minimal Editorial Ingestion workspace for manual source/extraction staging before real ZIP/document import begins.

Delivered:
- manual import session creation through the real UI
- mandatory provenance/source metadata before staging
- manual source memory and extraction candidate creation
- weak-confidence review surfacing
- duplicate uncertainty routing into duplicate review
- contradiction routing into continuity review
- narrative fragment preservation as non-canon material
- Dashboard queue updates for staged review material
- unchanged canon counts during manual staging

Validation:
- npm run build passed
- Electron dev launch passed
- real Electron UI smoke passed for manual import session creation, fake extraction candidates, provenance persistence, duplicate routing, contradiction routing, weak-confidence surfacing, narrative fragment preservation, Dashboard queue updates, autosave/status stability, Central Time timestamps, and unchanged canon counts

### Phase 35 — Import / Extraction Workflow Smoke + ZIP/Document Readiness Pass

Status: Passed

Summary:
Validated the protected ingestion framework against a real temp DB import/extraction workflow and patched Dashboard review routing into a stable detail surface.

Delivered:
- temp DB readiness smoke for safe import/session creation
- overlapping source records and extractions validated
- uncertain duplicates verified as review-only
- contradictions verified as continuity review items
- weak-confidence material verified as reviewable
- narrative fragments verified as preserved and non-canon
- Dashboard source, continuity, and confidence queue detail routing
- visible provenance/source state in Dashboard review detail
- unchanged canon counts during import/extraction workflows

Validation:
- npm run build passed
- Electron dev launch passed
- temp DB import/extraction smoke passed

### Phase 34 — Dashboard / Editorial Home Structural UX Pass

Status: Passed

Summary:
Reworked the Dashboard from a vertically stacked page into a calmer contained editorial home.

Delivered:
- desktop two-column Dashboard workspace
- primary Continue Working region
- contained Editorial Focus review column
- compact review queues for continuity review, source review, weak-confidence material, pending placement, open questions, and recent decisions
- continued surfacing for duplicate review, continuity review, unresolved extraction, narrative fragments, weak-confidence material, pending placement, and editorial risks
- preserved Central Time timestamps
- preserved autosave/status display and routing actions
- avoided internal phase labels in primary Dashboard UI

Validation:
- npm run build passed
- Electron dev launch passed
- manual Dashboard smoke confirmed reduced long-scroll sprawl and visible contained editorial review surfaces

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

### Phase 37 — Controlled ZIP / Document Import Entry Point

Goal:
Add the smallest safe user-facing ZIP/document import entry point now that protected ingestion structures, a review-oriented Dashboard home, readiness smoke validation, and a manual staging surface exist.

Why now:
Phase 33 created the safety framework, Phase 34 made review surfaces usable, and Phase 35 verified the workflow can preserve provenance and route risks without canon mutation. The next phase should expose a narrow controlled import path without bypassing duplicate review, continuity review, or explicit canon promotion.

Primary objectives:
- implement the narrowest ZIP/document import entry point
- keep source memory preserved
- keep extracted material reviewable before any canon promotion
- route uncertain duplicates into review
- route contradictions into continuity review
- keep Dashboard review surfaces useful

Strict non-goals:
- no automatic canon mutation
- no automatic duplicate merge
- no automatic contradiction resolution
- no bulk uncontrolled import
- no screenplay-authoring systems

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
