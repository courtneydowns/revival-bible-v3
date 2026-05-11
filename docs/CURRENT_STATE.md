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

The next recommended phase is controlled planning for source import / extraction now that the ingestion safeguards and Dashboard review home are in place.

Any next import work must remain review-first: preserve source memory, route uncertain duplicates and contradictions to manual review, keep provenance permanent, and require explicit user promotion for canon.
