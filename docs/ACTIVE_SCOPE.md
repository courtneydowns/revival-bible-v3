# ACTIVE_SCOPE.md

# Revival Bible v3 — Active Scope

## Current Phase

Phase 30 — Decision / Question Resolution Tracking Foundation

## Goal

Add a lightweight editorial resolution system for Decisions and Questions so the user can track what is open, what is resolved, why choices were made, and how resolution text evolves without any automatic canon mutation.

## Current Stable Status

- Phase 29 passed.
- Phase 30 build and temp DB/API smoke passed, but initial manual UI smoke failed on create controls, content editing, persisted status changes, and scrolling.
- Phase 30 debug patch addresses create controls, editable Decision/Question fields, persisted statuses, and scroll/accessibility fixes.
- Phase 30 UI polish pass reduces the admin/dashboard feel, calms the resolution editor layout, and adds guarded Decision/Question delete actions.
- Phase 30 editorial UX hardening adds question tier filtering/definitions, repairs Candidate Inbox filter/detail scrolling regressions, dismisses nav tooltips reliably, and improves autosave/timestamp copy in Central Time.
- Autosave/recovery foundation exists.
- Candidate Inbox status/tag filters work.
- Active/Traceable are passive derived summary text.
- Tags are color-coded/readable in dark mode.
- Candidate Inbox left column polish improved.
- Accepted remains non-canon until explicit promotion.
- Existing promotion/source traceability and AI Sessions remain stable.
- npm run build passes.

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
