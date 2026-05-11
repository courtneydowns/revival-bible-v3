# ACTIVE_SCOPE.md

# Revival Bible v3 — Active Scope

## Current Phase

Phase 31 — Tag / Status Management + Editorial Metadata Control — Passed build and smoke

## Goal

Give the user better control over tags, statuses, canon states, and review states without making the app feel like an admin dashboard.

## Current Stable Status

- Phase 29 passed.
- Phase 30 passed manual Electron smoke.
- Phase 31 added lightweight tag/status metadata control for Candidate Inbox and preserved Decision/Question metadata tools.
- Candidate metadata/search smoke passed.
- Decisions layout passes.
- Questions layout passes.
- Questions and Candidate filters pass.
- Candidate second column scrolling passes.
- Tooltip dismissal passes.
- Explicit Central Time autosave/status timestamp passes.
- Visible phase labels are removed/reduced enough for now.
- Autosave/recovery foundation exists.
- Candidate Inbox status/tag filters work.
- Active/Traceable are passive derived summary text.
- Tags are color-coded/readable in dark mode.
- Candidate Inbox left column polish improved.
- Accepted remains non-canon until explicit promotion.
- Existing promotion/source traceability and AI Sessions remain stable.
- npm run build passes.

## Phase 31 Scope

Allowed:
- Add or improve lightweight tag/status controls for Candidate Inbox, Decisions, and Questions.
- Allow manual candidate tag editing without promoting candidates to canon.
- Preserve Decision and Question tag/status editing through the existing editorial detail surfaces.
- Keep allowed tag/status meanings compact and contextual.
- Rebuild/update search indexing after tag/status/status-like edits.
- Preserve persistence after navigation/reload.
- Keep UI calm, editorial, and non-dashboard-like.
- Keep visible phase labels out of primary app UI.

Do not add:
- automatic canon mutation
- autonomous AI classification
- embeddings/vector search
- relationship inference
- enterprise dashboard surfaces
- giant admin tables
- broad schema rewrites

Acceptance Criteria:
- User can understand allowed tags/statuses without reading code.
- User can add/remove candidate tags and edit Decision/Question tags where supported.
- User can change review/status/canon-state fields where supported.
- Tag/status edits persist after navigation/reload.
- Search/filter behavior reflects edited metadata.
- Accepted candidates remain non-canon until explicit promotion.
- Existing Phase 30 layouts and fixes remain stable.
- npm run build passes.

## Future UI Direction

Visible "Phase" labels/listings should be removed or reconsidered in the app UI.

Phases are internal build/project-control metadata unless there is clear editorial value.

Prefer editorial labels:
- status
- canon state
- review state
- source/provenance
- decision history
- blockers/dependencies
- updated timestamp

## Phase 30 Scope

Allowed:
- Add Question states: Open, Tentatively Answered, Resolved, Deprecated.
- Add Decision states: Proposed, Accepted, Implemented, Reversed, Deprecated.
- Add editable final answer/final decision fields.
- Add editable rationale and resolution notes.
- Add visible New Decision and New Question controls.
- Add lightweight confirmed delete for Decisions and Questions.
- Support manual editing of Decision/Question content.
- Ensure Decision/Question workspace scrolling keeps controls reachable.
- Keep the resolution workflow calm, editorial, and readable rather than dashboard-like.
- Add lightweight tier clarity/filtering for Questions and tier meaning hints for Decisions.
- Keep Candidate Inbox filters and detail scrolling stable.
- Keep nav tooltips dismissible and autosave status meaningful with Central Time timestamps.
- Add minimal append-only prior-state history where practical.
- Preserve existing question/decision text and existing records.
- Keep linked entity patterns as-is.

Do not add:
- autonomous canon mutation
- automatic decision making
- automatic canon promotion
- AI classification
- embeddings/vector systems
- giant graph UI
- enterprise task management
- large refactors

## Acceptance Criteria

- Decisions and Questions show scannable resolution states.
- Final answer/final decision, rationale, and notes are editable and persistent.
- Existing records display without data loss.
- Nothing becomes canon automatically.
- UI remains calm/readable in dark mode.
- Decision and Question delete actions require lightweight confirmation.
- Candidate Inbox, promotion workflows, source traceability, autosave/recovery, and AI Sessions are not intentionally changed.

## Final Response Format

Files changed:
Root cause:
One sentence fix:
Build result:
Smoke result:
Unresolved blockers:
