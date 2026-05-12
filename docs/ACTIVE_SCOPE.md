# Revival Bible v3 — ACTIVE_SCOPE

Last updated: 2026-05-12 CDT

## Current focus

Move from Phase 42C/fix loops into a clean stabilization cluster:

**Phase 43 — Editorial Ingestion Workflow Stabilization**

Phase 43 exists because Phase 42 stabilized the source/session/review safety architecture, but repeated micro-fixes exposed broader UX comprehension, layout, and review-list readability problems that should no longer be handled as endless `42C-fixX` patches.

## Current status before Phase 43

Phase 42 core and follow-up fixes established:

- staged source attachment workflow
- native file picker path
- manual and auto-created intake session support
- source label/type/provenance autofill after attachment
- attachment success confirmation
- required-field indicators and validation paths
- non-canon staged review item creation
- Review Workspace / Review List counter clarification attempts
- footer/status calmness cleanup
- canon safety preserved during staged intake and review

Phase 42C-fix5 added the important workflow correction:

- choosing a source file can auto-create/select a calm intake session when needed
- users no longer have to manually create an import session before attaching a document
- sessions remain internally useful for provenance, grouping, recovery, rollback, and audit history, but should not feel mandatory/admin-first

## Why Phase 43 is needed

The architecture is now safe enough to stop patching counter/session details one at a time. The remaining problems are workflow-stabilization and UX-readability issues:

- Review List cards are cramped and visually confusing.
- Tags/chips can overlap or wrap badly.
- Review Workspace / Review List can feel like an abstract metrics dashboard instead of an editorial review surface.
- The user can lose track of where staged items appeared and what happens next.
- Scroll/clipping behavior is fragile.
- Nested review cards, checkboxes, badges, and list hierarchy need a calmer structure.
- Some wording still feels internal/tooling-oriented.
- The current Editorial Ingestion left intake column can still behave like a long stacked form.

## Phase 43 cluster plan

Break the work into focused stabilization subphases instead of more Phase 42C fixes.

### Phase 43A — Review List readability + card hierarchy

Goal: Make staged review items readable, scannable, and clearly connected to the review workflow.

Focus:
- Review List cards
- card hierarchy
- title/source/type/status layout
- checkbox alignment
- row-level “Newly staged” marker
- clear selected/active item state
- readable truncation rules
- calm density reduction

Known issue to include:
- Screenshot showed cramped nested review cards and confusing card boundaries in the Review Workspace.

### Phase 43B — Tag/chip wrapping and overflow behavior

Goal: Fix tags/chips/badges so they never overlap or crowd text.

Focus:
- chip wrapping
- chip spacing
- responsive behavior
- overflow handling
- avoiding badge/text collision
- no chips covering staged/latest item panels or review-list rows

Known issue to include:
- Tags/chips in Review Workspace cards overlapped and made the list look broken.

### Phase 43C — Review List scroll/clipping/responsive stability

Goal: Make the Review List reliably scrollable and inspectable across normal Electron window sizes.

Focus:
- scroll containers
- clipped panels
- fixed-height conflicts
- sticky/overflow behavior
- right-column/list usability
- moderate window resize behavior

### Phase 43D — Intake workflow simplification / source-first flow

Goal: Make the left intake area feel like source-first intake, not session-admin-first tooling.

Focus:
- source attachment as primary action
- auto session remains invisible/supportive unless needed
- session details editable but not blocking
- avoid one long stacked form
- consider contained sections, collapsible details, or light step flow

Do not remove the underlying session architecture.

### Phase 43E — Editorial action clarity

Goal: Make next actions understandable after staging.

Focus:
- Accept / Defer / placement wording
- selected item action state
- what happens next
- canon-safety reassurance
- empty/success/error states

## Current recommended next phase

Start with:

**Phase 43A — Review List readability + card hierarchy**

Reason: The most visible current problem is that the Review List itself is cramped, hard to read, and visually untrustworthy. Stabilizing the list/card hierarchy first will make later chip, scroll, and action clarity work easier to validate.

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
