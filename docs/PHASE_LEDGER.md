# Revival Bible v3 — PHASE_LEDGER

Last updated: 2026-05-12 CDT

## Recent phase status

### Phase 42 — Editorial Ingestion extraction triage architecture

Status: Passed / stabilized through follow-up fixes.

Summary:
Phase 42 added the staged-source and review-boundary architecture needed before real extraction/import work. Source material can be staged safely, review candidates remain non-canon, provenance is preserved, and canon counts remain unchanged.

Key outcomes:
- staged-source registration
- source attachment workflow
- native file picker work
- source/session persistence
- non-canon review candidates
- review counters/workspace clarification work
- attachment and staging success messages
- required indicators and validation paths
- source label/type/provenance autofill
- auto-created intake session on source attach when no session exists
- footer/status calmness cleanup

### Phase 42A — Attach Source stabilization

Status: Passed after fix loops.

Summary:
Stabilized source attachment, native file picker behavior, staged-source persistence, and related ingestion spacing/readability fixes.

### Phase 42B — Footer/status calmness cleanup

Status: Passed.

Files changed:
- src/components/StatusBar.jsx

Summary:
Replaced noisy visible SQLite path text with calmer local archive status language while preserving optional detail where appropriate.

### Phase 42C — Review Workspace counter clarity

Status: Passed technically, then expanded through fix loops due to broader workflow clarity issues.

Initial goal:
Clarify Review Workspace counters and align them with the visible review list.

Follow-up fixes addressed:
- stronger source attachment confirmation
- stronger staging confirmation
- required field indicators and validation paths
- source label/type/provenance autofill reliability
- Review List scroll restoration
- next-step copy
- row-level newly staged marker
- latest-staged panel layout
- auto-create intake session when attaching a source without a manual session

Important final workflow decision:
Sessions are still important internally but should not block source attachment. The UI should be source-first and auto-create/select an intake session when needed.

## Current transition

### Phase 43 — Editorial Ingestion Workflow Stabilization

Status: Planned / next cluster.

Reason:
Phase 42C fix loops exposed that remaining issues are no longer isolated counter/session bugs. They are UX stabilization issues across Review List readability, chip wrapping, scroll/clipping, source-first intake flow, and editorial action clarity.

Phase 43 should replace further `42C-fixX` loops unless a true regression from the last 42C patch must be repaired before committing.

## Planned Phase 43 subphases

### Phase 43A — Review List readability + card hierarchy

Status: Recommended next.

Goal:
Make staged review items readable, scannable, and clearly connected to the review workflow.

Acceptance focus:
- readable card hierarchy
- clear source/title/type/status arrangement
- checkbox alignment
- selected row state
- row-level newly staged marker
- less cramped density
- understandable review-list structure

### Phase 43B — Tag/chip wrapping and overflow behavior

Status: Planned.

Goal:
Fix tag/chip/badge overlap and wrapping in Review Workspace/List.

Known issue:
Screenshot showed `EXTRACTED CANDIDATE` and `UNREVIEWED` style chips overlapping and crowding review cards.

### Phase 43C — Review List scroll/clipping/responsive stability

Status: Planned.

Goal:
Ensure the Review List scrolls and remains inspectable across normal Electron window sizes.

### Phase 43D — Intake workflow simplification / source-first flow

Status: Planned.

Goal:
Keep sessions automatic/supportive while making source intake the obvious workflow.

### Phase 43E — Editorial action clarity

Status: Planned.

Goal:
Clarify what to do after staging: review, accept, defer, mark for placement, while reinforcing that canon remains unchanged until explicit promotion.
