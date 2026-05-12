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

### Phase 41 — Controlled Extraction Boundary

Status: Passed

Summary:
Added the smallest review-first extraction boundary from staged source memory into provenance-linked editorial candidates.

Delivered:
- existing staged source records are the only valid extraction input
- source provenance carries forward to candidates and narrative fragments
- extraction review states distinguish unresolved, in-review, and accepted-for-placement material
- staged sources, extracted candidates, accepted-for-placement records, and promoted canon are visually distinct
- duplicate uncertainty remains review-only and does not overwrite existing review records
- contradictions continue to route into continuity review without resolving canon
- direct status mutation to Promoted is blocked; canon still requires explicit promotion
- future AI assistance is bounded to reviewable suggestions only, with no canonization, merging, overwriting, or contradiction resolution authority

Validation:
- npm run build passed
- real Electron smoke passed against the app database through the renderer IPC bridge, with unchanged canon counts

### Phase 40 — Safe Editorial Ingestion Staging Foundations

Status: Passed

Summary:
Added safe staged-source registration inside Editorial Ingestion without extraction or canon mutation.

Delivered:
- attached staged sources inside import sessions
- session source counts and compact attached-source browsing
- preserved original filename, source type, file size, preview state, provenance notes, and Central Time import metadata
- lightweight TXT/MD previews with safe truncation
- placeholder preservation for PDF/DOC/DOCX/unsupported files
- visible boundary between staged source, extraction candidate, review item, and canon
- snapshot-compatible persistence through existing SQLite source memory records

Validation:
- npm run build passed
- real Electron smoke passed for session creation, TXT source attachment, preview/provenance visibility, reload persistence, snapshot creation/restore, Dashboard load, autosave stability, unchanged canon counts, and no automatic canon mutation

### Phase 39 — Recovery / Snapshot / Rollback Foundations

Status: Passed

Summary:
Added the local-first recovery layer needed before real ZIP/document import and extraction work.

Delivered:
- Settings Recovery maintenance entry point
- manual SQLite snapshot creation
- snapshot listing with Central Time timestamps, labels/reasons, app/data version, paths, and record counts
- confirmed restore flow with clear state-change warning
- automatic pre-restore safety backup before live database replacement
- search rebuild and app rehydration after restore
- simple manual snapshot retention cap
- future deleted-record recovery roadmap hook without canon-flow changes

Validation:
- npm run build passed
- real Electron smoke passed for snapshot creation, recovery UI listing, Central Time formatting, harmless edit, confirmed restore, pre-restore backup existence, Dashboard load, autosave/status stability, unchanged canon counts, and no automatic canon mutation

### Phase 38 — Editorial Review Workspace Refactor + Provenance Normalization

Status: Passed

Summary:
Refactored Editorial Ingestion into a calmer split-pane editorial review workspace and normalized provenance/confidence controls before true extraction/import work.

Delivered:
- scalable intake plus split-pane review workspace
- persistent review queue selection with readable detail inspection
- explicit Back to Queue, close, and Escape-to-close behavior
- provenance, source excerpt, continuity/conflict, duplicate, and editorial-note visibility in the detail pane
- controlled source taxonomy presets with optional custom labels preserved in provenance metadata
- controlled confidence levels: Confirmed, Strong, Moderate, Weak, and Speculative
- compatibility with older stored source/confidence values
- unchanged review-first routing and no automatic canon mutation

Validation:
- npm run build passed
- Electron smoke passed for split-pane review inspection, review navigation/exit behavior, source taxonomy presets, custom labels, confidence definitions, Dashboard queues, autosave stability, and unchanged canon counts

### Phase 37 — Manual Ingestion Retest + ZIP/Document Import Planning Gate

Status: Passed

Summary:
Re-smoked and hardened the real Editorial Ingestion workflow before enabling any real ZIP/document extraction work.

Delivered:
- backend provenance enforcement for import sessions and staged source material
- explicit source provenance note capture for manual extraction candidates
- source metadata and extraction persistence hardening
- autosave/status failure hardening when ingestion APIs are unavailable
- planning gate for future ZIP/document extraction safety
- manual canon authority clarification

Validation:
- npm run build passed
- real Electron UI smoke passed for manual import session creation, provenance enforcement, source metadata persistence, extraction candidate persistence, duplicate routing, contradiction routing, weak-confidence review, narrative fragment preservation, Dashboard queue updates, navigation/reload persistence, Central Time timestamps, autosave/status stability, and unchanged canon counts at 8/25/16/49

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

### Phase 42 — AI-Assisted Review-Only Extraction Boundary

Goal:
Allow AI-assisted extraction suggestions from staged sources while preserving the Phase 41 review boundary.

Why now:
Phase 41 now enforces staged-source-only extraction and review-state separation, so AI can be introduced only as a suggestion layer on top of preserved source memory.

Primary objectives:
- suggest extracted candidates from staged source previews
- carry source provenance into every AI-suggested candidate
- keep AI suggestions reviewable before acceptance or placement
- route uncertain duplicates into duplicate review
- route contradictions into continuity review
- keep Dashboard review surfaces useful

Strict non-goals:
- no automatic canon mutation
- no automatic duplicate merge
- no automatic contradiction resolution
- no autonomous extraction-to-canon
- no embeddings or vector search

Required safety behavior:
- duplicate uncertainty creates soft-merge review only
- contradictions create manual continuity review only
- weak-confidence material routes into review queues
- narrative fragments remain non-canon editorial memory
- rollback/recovery must never require canon edits
- create or encourage a snapshot before unstable extraction passes
- the user must explicitly promote any canon change

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
- use manual snapshots/pre-restore backups as the recovery base for unstable extraction passes

### Deleted Record Recovery / Trash

Future recovery work should start small:
- soft-delete/trash for editorial ingestion sessions, source records, extraction candidates, and narrative fragments
- recover or permanently remove only after explicit user choice
- preserve canon authority and avoid hidden promotions or destructive cleanups

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
