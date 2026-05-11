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
Status: Passed.

Summary:
- Docs-only roadmap/project-control audit.
- Future phases must preserve user authority, manual canon promotion, data safety, auditability, compact nav, calm UI, token-efficient Codex workflow, and output-control/silent mode.
- Approved product direction added for creative memory retrieval, canon confidence, imported conversation archives, decision/question resolution tracking, provenance backlinks, editorial attention surfaces, calm command-center dashboard direction, and long-term Slugline separation.
- Additional alignment added for creative state continuity, recoverability as a pillar, lightweight contradiction assistance, subtle provenance surfaces, historical creative evolution, editorial-state-derived dashboards, and Slugline continuity/provenance retrieval direction.

## Phase 29 — Autosave / Recovery + Candidate Inbox Filter Polish
Status: Passed.

Summary:
- Autosave/recovery foundation added.
- Candidate Inbox status/tag filters work.
- Active/Traceable are passive derived summary text.
- Candidate tags are color-coded/readable in dark mode.
- Candidate Inbox left column polish improved.
- Accepted remains non-canon until explicit promotion.
- npm run build passed.

## Phase 30 — Decision / Question Resolution Tracking Foundation
Status: Editorial UX hardening implemented; manual UI smoke pending rerun.

Summary:
- Initial manual UI smoke failed because create controls were missing, content editing was incomplete, status changes were not obvious/persistent enough, and Decision/Question detail scrolling could hide lower controls.
- Questions gained Open, Tentatively Answered, Resolved, and Deprecated resolution states.
- Decisions gained Proposed, Accepted, Implemented, Reversed, and Deprecated resolution states.
- Visible New Decision and New Question controls were added.
- Guarded delete actions were added for Decisions and Questions.
- Decision/Question content plus resolution fields are editable in the detail panels.
- Resolution statuses persist through manual user edits.
- Decision/Question scroll/accessibility was tightened so lower controls remain reachable.
- The resolution UI was calmed to reduce stacked admin-card/dashboard weight.
- Question tier filtering/definitions and Decision tier hints were added for clarity.
- Candidate Inbox filter/detail scrolling regression was repaired.
- Nav tooltip dismissal was hardened.
- Autosave/status footer and displayed timestamps were improved with Central Time formatting.
- Final Answer / Final Decision, Rationale, and Resolution Notes are editable.
- Prior resolution values are preserved in lightweight append-only history fields.
- Manual editorial authority is preserved; nothing becomes canon automatically.
