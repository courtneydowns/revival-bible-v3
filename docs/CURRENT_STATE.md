# Revival Bible v3 — Current State

## Stable Product Direction

Revival Bible v3 is a continuity-aware editorial operating system, creative memory archive, canon-management environment, provenance system, and narrative development memory layer.

The system prioritizes:
- recall
- provenance
- editorial trust
- continuity confidence
- narrative traceability
- calm UX
- recoverability
- long-term project memory

The system should not become:
- an autonomous canon mutation engine
- an enterprise dashboard
- a noisy workflow system
- an over-automated writing tool
- a screenplay drafting replacement for Slugline

The user remains authoritative. Nothing becomes canon automatically.

## Current Stable Memory Model

### Source Memory

Source Memory preserves raw or imported material without treating it as canon. This includes raw imports, AI exports, notes, rewrite batches, abandoned concepts, source archives, and other preserved creative material.

### Editorial Memory

Editorial Memory contains reviewable, unresolved, or in-progress material. This includes candidates, unresolved questions, continuity risks, narrative fragments, extracted material, duplicate review items, contradiction review items, and pending placement material.

### Canon Memory

Canon Memory contains explicitly promoted material only. Repetition across sources does not make a claim canon.

## Completed Phase 41 State

Phase 41 passed and added the controlled extraction-review boundary.

Confirmed capabilities:
- extraction candidates must originate from existing staged source records
- source provenance carries forward to each extracted candidate or narrative fragment
- extracted material remains editorial memory with explicit review states
- unresolved, in-review, and accepted-for-placement states remain separate from promoted canon
- duplicate uncertainty creates/keeps review records without merging or overwriting them
- contradictions continue to route into manual continuity review without resolving canon
- direct status mutation to Promoted is blocked; canon creation still requires explicit promotion
- Editorial Ingestion visually differentiates Staged Source, Extracted Candidate, Accepted for Placement, and Promoted Canon
- future AI extraction remains review-only: AI may suggest structured candidates, but cannot canonize, merge, overwrite, or resolve contradictions

Validation:
- npm run build passed
- real Electron smoke passed against the app database through the renderer IPC bridge; staged source extraction, pending placement, duplicate preservation, direct promotion blocking, and unchanged canon counts were verified

## Completed Phase 40 State

Phase 40 passed and added a safe staged-source layer before extraction work begins.

Confirmed capabilities:
- Editorial Ingestion sessions show attached source counts
- local TXT/MD files can be attached to sessions as staged source memory
- original filename, source type, file size, preview state, provenance note, and Central Time import metadata are preserved
- TXT/MD sources get lightweight readable previews, truncated safely when needed
- PDF/DOC/DOCX/unsupported files are preserved as safe placeholder source records without destructive failure
- sessions show compact attached-source lists with staged/unreviewed state
- Review Workspace visibly separates staged sources from extraction candidates, duplicate reviews, continuity reviews, fragments, and canon
- source records remain non-canon and do not auto-create entities, candidates, embeddings, or promotions
- snapshots include staged ingestion state because staged sources live in SQLite source memory

Validation:
- npm run build passed
- real Electron smoke passed for session creation, TXT source attachment, preview/provenance visibility, reload persistence, snapshot creation, snapshot restore, Dashboard load, autosave stability, unchanged canon counts, and no automatic canon mutation

## Completed Phase 39 State

Phase 39 passed and added a minimum viable local recovery/snapshot safety layer before real import/extraction work.

Confirmed capabilities:
- Settings includes a calm Recovery maintenance area
- manual SQLite snapshots can be created with a label/reason
- snapshots list with readable Central Time timestamps and lightweight record counts
- snapshot metadata preserves app/data version, created time, label, path, and record counts
- restore requires explicit confirmation and explains that current state will change
- restore creates a pre-restore safety backup before replacing the live database
- restore reopens SQLite, rebuilds search, and rehydrates app state
- manual snapshots use a simple rolling retention cap to avoid unbounded growth
- restore-time backups are preserved and not pruned during restore
- canon counts and canon mutation paths remain unchanged unless the user intentionally restores a prior snapshot

Recovery direction:
- deleted-record recovery remains a future dedicated phase
- any future trash/recovery work should begin with editorial ingestion/session/candidate records and avoid destabilizing canon flows
- future ZIP/document import and extraction phases should create snapshots before unstable passes or destructive recovery operations

Validation:
- npm run build passed
- real Electron smoke passed for manual snapshot creation, snapshot UI visibility, Central Time formatting, harmless test edit, confirmed restore, pre-restore backup creation, Dashboard loading, autosave/status stability, unchanged canon counts at 25/8/16/49, and no automatic canon mutation

## Completed Phase 38 State

Phase 38 passed and turned Editorial Ingestion from a cramped staging/review surface into an archival split-pane editorial review workspace.

Confirmed capabilities:
- Editorial Ingestion uses a left intake column and a split review workspace with queue and detail panes
- review selection is persistent until explicitly changed or cleared
- selected items show readable provenance, source type, confidence, timestamps, raw source excerpts, review material, continuity context, duplicate context, and editorial notes
- visible Back to Queue and close controls clear selection
- Escape clears review selection
- source taxonomy uses controlled presets: Draft Notes, Outline, Character Notes, Episode Notes, Timeline Notes, Voice Memo, AI Session, Previous Bible, Imported Document, Research / Interview, Fragment, and Unknown
- optional custom source labels remain preserved in provenance metadata
- confidence uses controlled editorial levels: Confirmed, Strong, Moderate, Weak, and Speculative
- older stored source and confidence values remain displayable
- duplicate uncertainty, contradiction routing, weak-confidence review, narrative fragment preservation, Dashboard queues, autosave behavior, and canon safety rules remain review-first

Validation:
- npm run build passed
- Electron smoke verified the split-pane review workspace, queue/detail selection, explicit close/back navigation, Escape-to-close behavior, source presets, optional custom labels, confidence presets, Dashboard queue visibility, autosave stability, and unchanged canon counts

## Completed Phase 37 State

Phase 37 passed and hardened the real Editorial Ingestion workflow before any ZIP/document extraction entry point is enabled.

Confirmed capabilities:
- manual import sessions persist from the real Electron UI
- provenance is required for sessions and staged source material
- source labels, source provenance notes, raw source excerpts, and extraction candidates persist
- duplicate uncertainty routes into soft-merge review without merging
- contradictions route into continuity review without resolving or mutating canon
- weak-confidence material remains reviewable
- narrative fragments remain preserved and non-canon
- Dashboard source, continuity, and confidence queues update after staging
- navigation away/back and app reload preserve staged review material
- autosave/status display remains stable
- Central Time timestamps remain visible
- canon counts remain unchanged at 8/25/16/49

ZIP/document import gate requirements:
- preserve raw source memory before extraction
- require permanent provenance on sessions, sources, extractions, duplicate reviews, continuity reviews, and fragments
- batch imports into auditable extraction sessions
- keep duplicate uncertainty in soft-merge review until the user chooses an outcome
- route contradictions into manual continuity review with source-by-source claims
- keep weak-confidence material in review queues
- preserve narrative fragments as non-canon editorial memory
- support rollback/recovery without canon mutation
- require pre-canon editorial review and explicit user promotion

The user remains authoritative. Nothing becomes canon automatically.

Validation:
- npm run build passed
- real Electron UI smoke passed for manual session creation, provenance enforcement, source/extraction persistence, duplicate routing, contradiction routing, weak-confidence review, narrative fragment preservation, Dashboard queue updates, navigation/reload persistence, unchanged canon counts, autosave/status stability, and Central Time timestamps

## Completed Phase 36 State

Phase 36 passed and exposed a minimal safe Editorial Ingestion surface for manual import/extraction testing through the real UI.

Confirmed capabilities:
- manual import sessions can be created from the UI
- provenance is required before a session or staged extraction can be saved
- source memory records preserve raw manual excerpts
- extraction candidates persist as reviewable, non-canon editorial memory
- duplicate uncertainty routes into duplicate review without merging
- contradictions route into continuity review without mutating canon
- weak-confidence material surfaces in review queues
- narrative fragments remain preserved and non-canon
- Dashboard source, continuity, and confidence queues update after manual staging
- Dashboard review detail continues to show provenance/source state
- Central Time timestamps remain visible
- autosave/status display remains stable
- canon counts remain unchanged during manual staging

Validation:
- npm run build passed
- Electron dev launch passed
- real Electron UI smoke passed for manual session creation, fake extraction staging, duplicate routing, contradiction routing, weak-confidence surfacing, narrative fragment preservation, Dashboard queue updates, unchanged canon counts, autosave/status stability, and Central Time timestamps

## Completed Phase 35 State

Phase 35 passed and validated import/extraction readiness for upcoming ZIP/document workflows.

Confirmed capabilities:
- safe import/session creation works in a temp DB workflow
- source memory records preserve raw content and provenance
- editorial extractions persist as reviewable, non-canon material
- uncertain duplicates route to duplicate review without creating canon duplicates
- contradictions route to continuity review without mutating canon
- weak-confidence material remains reviewable
- narrative fragments remain preserved and non-canon
- Dashboard source, continuity, and confidence queues update after extraction activity
- Dashboard review items open into a detail surface with provenance/source state visible
- Central Time timestamps remain visible
- primary Dashboard UI avoids internal phase labels
- autosave/status display remains stable
- canon counts remain unchanged during import/extraction workflows

Validation:
- npm run build passed
- Electron dev launch passed
- temp DB import/extraction smoke passed

## Completed Phase 34 State

Phase 34 passed and reworked the Dashboard / Editorial Home structure.

Confirmed capabilities:
- Dashboard uses a contained two-column editorial workspace on desktop
- Continue Working remains a primary continuation region
- Editorial Focus is a stable review column with compact contained queues
- review queues surface continuity review, source review, weak-confidence material, pending placement, open questions, and recent decisions
- Phase 33 duplicate review, continuity review, unresolved extraction, narrative fragment, weak-confidence, pending-placement, and editorial-risk concepts remain visible
- Central Time timestamps remain visible
- primary Dashboard UI avoids internal phase labels
- autosave/status display and Dashboard routing actions remain stable

Validation:
- npm run build passed
- Electron dev launch passed
- manual Dashboard smoke confirmed the view no longer presents as one long scrolling admin page

## Completed Phase 33 State

Phase 33 passed and added the foundational ingestion and continuity protection framework.

Confirmed capabilities:
- import sessions exist as architecture groundwork
- source memory structures exist
- editorial extraction structures exist
- duplicate review groundwork exists
- contradiction/continuity review routing exists
- narrative fragment groundwork exists
- provenance records are preserved
- Dashboard surfacing groundwork exists
- IPC/preload/store plumbing exists
- canon is not mutated automatically

Validation:
- npm run build passed
- Electron dev launch passed
- transactional SQLite smoke passed
- duplicate review, contradiction routing, provenance persistence, continuity review creation, narrative fragment creation, and unchanged canon counts were verified

## Canon and Ingestion Rules

- Imported material must never become canon automatically.
- Contradictory imports preserve conflicting claims and route to manual review.
- Duplicate uncertainty creates soft-merge review rather than automatic merge.
- Provenance must be preserved for all imported, extracted, promoted, or reviewable material.
- AI may help extract and organize material, but does not get authority to canonize, merge, overwrite, or resolve contradictions.
- Ambiguity is allowed to remain ambiguous until the user resolves it.

## Slugline Separation

Slugline remains responsible for:
- screenplay authoring
- screenplay formatting
- drafting and revision workflow

Revival Bible remains responsible for:
- editorial memory
- continuity awareness
- provenance
- canon traceability
- unresolved narrative material
- editorial continuation

## Immediate Next Direction

The next recommended phase is an AI-assisted review-only extraction boundary on top of Phase 41.

Any AI-assisted extraction work must remain review-first: staged source, AI suggestion, extracted candidate, accepted-for-placement, and promoted canon must stay visibly distinct; provenance must carry forward; uncertain duplicates and contradictions must route to manual review; and explicit user promotion remains required for canon.
