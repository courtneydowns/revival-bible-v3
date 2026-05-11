# ROADMAP.md

# Revival Bible v3 — Roadmap

## Core Rule

Nothing becomes canon automatically.

The user remains authoritative. All promotion, merging, canonization, and continuity decisions must remain explicit and reviewable.

## Current Roadmap Position

Completed / passed:
- Phase 19 through Phase 26C passed.
- Candidate Inbox foundation stable.
- Manual extraction stable.
- Candidate editing/review notes stable.
- Candidate source-session linking stable.
- Promotion traceability/backlinking stable.
- Accepted / Needs Placement workflow stable.
- Compact nav/tooltips/scrolling stable.
- OpenAI and Claude generation work.
- npm run build passes.

Current / next:
- Phase 27 — Candidate Inbox Queue Organization
- Phase 28 — Roadmap Audit + Project-Control Docs Update

## Remaining Roadmap Arc

The remaining roadmap should focus less on foundational architecture and more on:
- queue clarity
- editorial workflow quality
- data safety
- review confidence
- continuity assistance
- auditability
- production-readiness
- calm UI polish

## Planned Phases / Workstreams

### Phase 27 — Candidate Inbox Queue Organization

Goal:
Improve queue clarity in Candidates Inbox so Pending, Accepted, Needs Placement, Promoted, and Rejected candidates are easier to understand and scan.

Include:
- status filtering similar to search filtering
- clearer status labels
- queue counts if low-noise
- calmer empty states
- better Accepted vs Needs Placement distinction
- keep Promoted and Rejected accessible without crowding active review

Do not add:
- kanban
- drag/drop
- bulk actions
- new workflows
- canon automation

### Phase 28 — Roadmap Audit + Project-Control Docs Update

Goal:
Audit roadmap/project-control docs against completed phases, backlog, and prior recommendations.

Include:
- autosave/autobackup/data safety hardening as a dedicated phase
- Candidate status filtering/organization
- search/tag/status management
- manual merge/review tooling
- audit/history systems
- production-readiness hardening
- token-efficient Codex workflow rules

Docs-only phase.

### Future Phase — Autosave / Autobackup / Data Safety Hardening

Goal:
Protect user-authored canon, candidates, sessions, and editorial records from silent loss.

Include:
- autosave important app state
- autobackup SQLite/database data
- backup before risky migrations
- recovery/export path for canon data
- edit persistence hardening
- no silent data loss
- restart/navigation persistence smoke tests
- confirmations before destructive actions
- clear failure states when saving fails

Acceptance:
- app data survives navigation
- app data survives restart
- risky destructive actions require confirmation
- database backup/recovery path is documented and smoke-tested

### Future Phase — Tag / Status Management

Goal:
Make tags and statuses understandable, editable, searchable, and trustworthy.

Include:
- master tag list
- tag metadata/editing if appropriate
- allowed tag/status validation
- tag-vs-text search result distinction
- support natural tag search variants
- clarify status badges vs canon tags
- update search indexes after tag/status edits

### Future Phase — Manual Merge / Review Tooling

Goal:
Support careful human-led consolidation without automatic canon mutation.

Include:
- candidate-to-existing-record comparison
- manual merge/review editor
- provenance preservation
- clear before/after changes
- no automatic merging

### Future Phase — Continuity / Timeline Assistance

Goal:
Help surface continuity issues while keeping user authority.

Include:
- continuity reminders
- timeline references
- contradiction-risk visibility
- source-backed suggestions
- no autonomous canon changes
- no relationship inference as fact

### Future Phase — Audit / History Systems

Goal:
Make canon/editorial changes traceable and reversible where possible.

Include:
- decision history
- promotion history
- source backlinks
- candidate history
- lightweight audit trails
- recovery-oriented review

### Future Phase — Export / Recovery / Portability

Goal:
Ensure user can recover and move critical creative data.

Include:
- export canon/story bible data
- export candidates or review records if useful
- export AI session history if useful
- document restore process
- document backup locations

### Future Phase — Production UX Polish

Goal:
Make the app calmer, clearer, and safer for daily writing/editing.

Include:
- layout polish
- responsive cleanup
- empty states
- low-noise controls
- compact nav preservation
- accessibility/readability improvements
- reduced crowding

## Permanent Constraints

Do not build:
- autonomous AI agents
- automatic canon mutation
- automatic merging
- relationship inference as fact
- embeddings/vector systems unless deliberately approved later
- enterprise dashboards
- broad rewrites
- modal-heavy workflows
- kanban/drag-drop unless explicitly requested

## Codex Workflow Rules

Use:
- surgical patches
- ACTIVE_SCOPE
- targeted files
- small commits
- concise final reports
- no giant diffs/logs
- no progress narration
- docs-first context
- exact smoke tests

Codex final response format:
Files changed:
Root cause:
One sentence fix:
Build result:
Smoke result:
Unresolved blockers:

## Commit Guidance

After each passed phase:
- check git status
- commit the phase changes
- push when the phase is stable and the user confirms pass

The assistant should remind the user when it is a good time to push commits.
