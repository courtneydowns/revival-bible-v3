# Revival Bible v3 — Phase Ledger

## Phase 26A — Editorial Workspace Layout Stabilization
Status: Passed.

Summary:
- Candidate Inbox layout was rebalanced.
- Left candidate navigator was narrowed.
- Candidate list became independently scrollable.
- Right detail panel returned to document-style page scrolling.
- Provenance/meta readability passed.
- Location promotion target reachability passed.
- Compact nav scrolling/tooltips passed.

## Phase 26B — Candidate Acceptance Queue
Status: Passed with manual UI retest pending.

Summary:
- Accepted / Needs Placement workflow exists.
- Build passed.
- Temp SQLite workflow smoke passed.
- Accepted state persisted.
- Accepted state did not mutate canon.
- Accepted candidate edit persisted.
- Later promotion preserved provenance.
- Browser UI smoke was blocked by `net::ERR_BLOCKED_BY_CLIENT`.
- Compact nav/tooltips were not re-smoked due to browser block.

## Phase 26C — Candidate Acceptance UI Retest + Editorial Queue Polish
Status: Passed.

Summary:
- Accepted / Needs Placement UI clarity passed.
- Editorial queue polish passed.
- Accepted candidates remained non-canon until explicit promotion.

## Phase 27 — Candidate Inbox Queue Organization
Status: Passed except browser UI smoke was not run.

Summary:
- Candidate Inbox queue organization improved.
- Queue labels/status summaries/counts were added.
- Pending, Accepted, Needs Placement, Promoted, and Rejected became clearer.
- Accepted candidates remain non-canon until explicitly promoted.
- Edit/promote/reject/source navigation paths remained stable.
- npm run build passed.

## Phase 28 — Roadmap Audit + Project-Control Docs Update
Status: In progress.

Summary:
- Docs-only roadmap/project-control audit.
- Future phases must preserve user authority, manual canon promotion, data safety, auditability, compact nav, calm UI, token-efficient Codex workflow, and output-control/silent mode.
- Approved product direction added for creative memory retrieval, canon confidence, imported conversation archives, decision/question resolution tracking, provenance backlinks, editorial attention surfaces, calm command-center dashboard direction, and long-term Slugline separation.
- Additional alignment added for creative state continuity, recoverability as a pillar, lightweight contradiction assistance, subtle provenance surfaces, historical creative evolution, editorial-state-derived dashboards, and Slugline continuity/provenance retrieval direction.
