# Revival Bible v3 — ACTIVE_SCOPE

Last updated: 2026-05-15 CDT

## Current focus

Keep Editorial Ingestion / Review Queue stable after the recent stabilization passes. The current task is docs/control sync only; no app behavior should change.

**Current stable cluster — Editorial Ingestion / Review Queue stabilization**

Phase 43 has stabilized the review surface enough that the next work should be deliberate backlog work, not tiny visual churn. Source material intake remains source-first, provenance remains preserved, and Review Queue is now flattened so source/batch context informs review without becoming a navigation gate.

## Current stable state

Phase 42 and Phase 43 follow-up stabilization established:

- staged source attachment workflow
- native file picker path
- manual and auto-created intake session support
- source label/type/provenance autofill after attachment
- attachment success confirmation
- required-field indicators and validation paths
- non-canon staged review item creation
- Review Workspace / Review Queue counter clarification
- footer/status calmness cleanup
- canon safety preserved during staged intake and review
- Editorial Ingestion Source Material tab scrolls/focuses back to the Source Material section top
- Source Material readability/layout remains improved
- Dashboard, routing, and Review Detail behavior remain stable
- counters stay on one row, including `Visible Review Queue`

Review Queue is currently stable with these decisions:

- Review Queue is flattened; source/batch groups are context headers, not navigation gates.
- Review Queue items are visible directly without opening source batches.
- Source/batch context remains provenance, not primary navigation.
- Review Queue cards remain collapsed/summary-style by default.
- Selected Review Queue card styling is clear and distinct from checkbox/batch triage selection.
- Review Queue checkboxes are selection/triage controls only.
- No bulk delete/remove workflow has been implemented yet.

## Completed UI decisions

Keep these decisions unless a concrete usability issue appears:

- Review Queue should be inspectable at the item level immediately.
- Source/batch grouping should support provenance and scanning, not block review.
- Summary-style cards are the default queue density.
- Checkbox selection is for triage only and must not imply navigation or deletion.
- Active/selected review-card state must stay visually separate from checkbox selection.
- Calm editorial UX and canon safety take priority over dense admin controls.

## Future backlog

Do not start these without an explicit future phase:

- safe bulk Review Queue remove/delete
- safe Review Queue item deletion
- safe source material removal, batch archive, or batch removal
- stored Source Material long-list browsing/scaling
- Editorial Intake / Review Queue status and type colored tags
- larger extraction/review automation work

## Strict constraints for Phase 43

- Do not mutate canon.
- Do not change canon promotion behavior unless the phase explicitly requires action-copy clarity only.
- Do not rewrite the database/schema unless explicitly scoped and unavoidable.
- Do not redesign Dashboard.
- Do not restart extraction automation work.
- Do not make sessions user-blocking again.
- Do not do broad opportunistic refactors.
- Keep each subphase surgical and testable.
- Prefer one or two files per subphase when possible.
- Avoid further tiny visual churn unless a concrete issue appears.
- Preserve calm editorial UX and canon safety.

## Codex workflow rules

Future prompts must include:

- concise phase scope
- exact files/docs to read
- no broad repo scans
- silent mode
- no interim narration
- no command narration
- final report only
- expected runtime/fail threshold
- real Electron smoke requirements

## Output control reminder

Codex final report only:

Files changed:
Root cause:
One sentence fix:
Build result:
Smoke result:
Unresolved blockers:
