# ACTIVE_SCOPE.md

# Revival Bible v3 — Active Scope

## Current Phase

Phase 28 — Roadmap Audit + Project-Control Docs Update

## Goal

Audit the current roadmap and project-control docs against the actual product direction, completed phases, known backlog items, and prior recommendations, then update the docs so future phases include data safety, autosave/autobackup, recoverability, candidate queue organization, editorial workflow polish, creative memory retrieval, creative state continuity, canon confidence, provenance/archive direction, and production-readiness hardening.

## Current Stable Status

- Phase 26A passed.
- Phase 26B passed.
- Phase 26C passed.
- Phase 27 passed except browser UI smoke was not run.
- Candidate Inbox architecture is stable.
- Candidate Inbox queue organization improved.
- Queue labels/status summaries/counts were added.
- Pending, Accepted, Needs Placement, Promoted, and Rejected are clearer, with further organization/filtering still planned.
- Accepted / Needs Placement workflow exists.
- Accepted state persists correctly.
- Accepted candidates remain editable.
- Accepted candidates can still be promoted normally.
- Accepted state clearly says: “Accepted for future placement. Not canon until promoted.”
- Accepted candidates remain non-canon until explicitly promoted.
- Existing promotion workflows still work.
- Existing provenance/source navigation still works.
- Compact nav scrolling/tooltips work.
- OpenAI generation works.
- Claude / Anthropic generation works.
- npm run build passes.

## Phase 28 Scope

Update project-control docs only.

Allowed files:
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PATCH_CLASSES.md
- docs/PHASE_LEDGER.md if it already exists and needs a brief status note
- docs/SMOKE_TESTS/ only if adding a small docs-only smoke checklist is appropriate

Do not touch app code during this phase.

## Required Audit Additions

Make sure the roadmap/backlog explicitly includes:

- autosave
- autobackup
- database backup before risky migrations
- recovery/export path for canon data
- safer edit persistence
- destructive-action confirmations
- no silent data loss
- persistence smoke tests after navigation/restart
- Candidates Inbox status filtering / queue organization
- clearer Pending vs Accepted vs Needs Placement vs Promoted vs Rejected organization
- accepted candidates remain non-canon until explicit promotion
- promotion traceability
- source-session provenance
- manual merge/review tooling
- audit/history systems
- tag/status management
- search result clarity, including tag-vs-text distinction
- master tag list
- continuity/timeline tooling
- calm UI/layout cleanup
- compact nav preservation
- production-readiness hardening
- token-efficient Codex workflow
- surgical debug loop
- concise output control
- continuity-aware editorial operating system identity
- creative continuity confidence and creative memory retrieval
- manual canon authority
- future Decision/Question resolution tracking
- canon confidence levels
- Imported Conversations / Claude dump pipeline
- brainstorming/conversation classification categories
- lightweight backlinks/provenance surfaces
- Accepted / Needs Placement organizational grouping
- Editorial Focus / Needs Attention dashboard layer
- calm creative command center dashboard direction
- long-term Slugline integration direction without premature coupling
- explicit clarification that Revival Bible is not a generic to-do list, kanban board, enterprise dashboard, or productivity app
- creative state continuity when reopening the project later
- recovery, autosave, and recoverability as core product pillars
- distinction between serious canon discussion, exploratory brainstorming, non-canon exploration, abandoned ideas, and joke/throwaway discussion
- contradiction systems as lightweight editorial assistance, not autonomous canon resolution
- subtle, expandable backlinks/provenance surfaces instead of graph-heavy interfaces
- dashboard/task systems derived from editorial state
- historical creative evolution, including abandoned and alternate ideas
- future Slugline support for continuity-aware drafting, screenplay-to-canon provenance linkage, and canon/context retrieval during drafting
- future priorities: continuity trust, editorial confidence, provenance, recall, recoverability, and low-friction creative workflows over aggressive AI automation or enterprise workflow complexity

## Strict Scope

Do not add:
- new app features
- code changes
- new architecture
- embeddings/vector systems
- autonomous AI agents
- automatic canon mutation
- auto-merge
- relationship inference
- kanban boards
- drag/drop systems
- broad rewrites

## Acceptance Criteria

- ROADMAP.md clearly reflects remaining roadmap priorities.
- CURRENT_STATE.md reflects stable completed systems without becoming a backlog dump.
- ACTIVE_SCOPE.md points future work toward docs audit and then Phase 29 continuation.
- Docs mention autosave/autobackup/data safety as a dedicated hardening phase.
- Docs mention Candidates Inbox status filtering/organization as a planned or current queue clarity feature.
- Docs mention creative memory, canon confidence, imported conversations, provenance backlinks, and editorial attention surfaces as future directions.
- Docs mention creative state continuity, recoverability, lightweight contradiction assistance, historical creative evolution, and editorial-state-derived dashboard surfaces.
- Docs preserve the rule: nothing becomes canon automatically.
- Docs preserve token-management and output-control rules.
- npm run build is not required unless Codex chooses to verify no app files changed, but git diff should confirm docs-only changes.

## Final Response Format

Files changed:
Root cause:
One sentence fix:
Build result:
Smoke result:
Unresolved blockers:
