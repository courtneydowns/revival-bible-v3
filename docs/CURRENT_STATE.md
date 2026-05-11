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

The next recommended phase is a Dashboard / Editorial Home Structural UX Pass.

This phase should address the pending long-scroll Dashboard issue now that Phase 33 has created the ingestion/review structures the Dashboard needs to surface.

The Dashboard should become a calmer editorial home with contained sections, stronger Continue Working and Editorial Focus hierarchy, clear review surfaces, and less vertical sprawl. It should not become an enterprise dashboard and should not show internal build phase labels in primary UI.
