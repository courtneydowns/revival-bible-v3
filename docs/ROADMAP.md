# ROADMAP.md

# Revival Bible v3 — Roadmap

## Core Rule

Nothing becomes canon automatically.

The user remains authoritative. All promotion, merging, canonization, and continuity decisions must remain explicit and reviewable.

Revival Bible v3 is not a generic to-do list, kanban board, enterprise dashboard, or productivity app. It is a continuity-aware editorial operating system: a permanent creative memory system, canon-management environment, provenance/archive layer, and decision-history system.

Core differentiator:
- creative continuity confidence
- creative memory retrieval
- creative state continuity across sessions

When reopening the project later, the user should quickly understand:
- what matters
- what is unresolved
- what changed
- what needs attention
- what is risky
- where ideas originated

## Current Roadmap Position

Completed / passed:
- Phase 19 through Phase 26C passed.
- Phase 27 passed except browser UI smoke was not run.
- Candidate Inbox foundation stable.
- Manual extraction stable.
- Candidate editing/review notes stable.
- Candidate source-session linking stable.
- Promotion traceability/backlinking stable.
- Accepted / Needs Placement workflow stable.
- Candidate Inbox queue organization improved.
- Queue labels/status summaries/counts added.
- Compact nav/tooltips/scrolling stable.
- OpenAI and Claude generation work.
- npm run build passes.
- Phase 29 passed.
- Phase 30 foundation added for Decision / Question resolution tracking.
- Phase 30 debug patch addressed initial manual UI smoke failures for create controls, editable content/resolution fields, persisted statuses, and scrolling/accessibility.
- Phase 30 UI polish added guarded delete actions and reduced the admin/dashboard feel of Decision and Question resolution editing.
- Phase 30 editorial UX hardening added tier filtering/definitions, tooltip cleanup, Candidate Inbox regression repair, and Central Time autosave/timestamp polish.
- Phase 30 passed manual Electron smoke.

Current / next:
- Next — continue surgical implementation from remaining roadmap priorities

## Remaining Roadmap Arc

The remaining roadmap should focus less on foundational architecture and more on:
- queue clarity
- editorial workflow quality
- data safety
- review confidence
- continuity assistance
- creative memory retrieval
- canon confidence
- auditability
- continuity trust
- editorial confidence
- provenance
- recall
- recoverability
- low-friction creative workflows
- production-readiness
- calm UI polish

These priorities should outrank aggressive AI automation or enterprise workflow complexity.

## Planned Phases / Workstreams

### Phase 27 — Candidate Inbox Queue Organization

Status:
Passed except browser UI smoke was not run.

Goal:
Improve queue clarity in Candidates Inbox so Pending, Accepted, Needs Placement, Promoted, and Rejected candidates are easier to understand and scan.

Completed:
- clearer status labels and summaries
- queue counts
- clearer Pending, Accepted, Needs Placement, Promoted, and Rejected organization
- stable edit/promote/reject/source navigation paths
- Accepted candidates remain non-canon until explicit promotion

Remaining:
- continue status filtering/organization similar to search filtering
- keep Promoted and Rejected accessible without crowding active review
- preserve compact nav and calm UI

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

Recovery, autosave, and recoverability are core product pillars.

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
- explicit backup of SQLite/database before risky migrations

Acceptance:
- app data survives navigation
- app data survives restart
- risky destructive actions require confirmation
- database backup/recovery path is documented and smoke-tested
- canon data has a recovery/export path

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

### Future Phase — Creative Memory / Imported Conversations

Goal:
Make old development conversations useful without letting imported material mutate canon.

Include:
- immutable source archive for imported conversations / Claude dumps
- chunked reader for long imports
- immediate search over imported source text
- annotations, tags, and bookmarks
- manual extraction from imports into Candidates
- manual promotion only
- conversation classification such as Serious Canon Discussion, Canon Proposal, Working Canon, Canon Conflict, Exploratory Brainstorming, Wild Ideas, Alternate Timeline, Non-Canon Exploration, Continuity Review, Episode Planning, Arc Planning, Revisit Later, Joke/Throwaway, Research Notes, and Timeline Notes
- clear distinction between serious canon discussion, exploratory brainstorming, non-canon exploration, abandoned ideas, and joke/throwaway discussion
- preservation of historical creative evolution, including abandoned and alternate ideas, as long-term narrative memory

### Phase 30 — Decision / Question Resolution Tracking

Status:
Passed manual Electron smoke.

Goal:
Track creative decisions and open questions through resolution without turning them into automatic canon.

Completed foundation:
- Question states: Open, Tentatively Answered, Resolved, Deprecated
- Decision states: Proposed, Accepted, Implemented, Reversed, Deprecated
- visible New Decision and New Question controls
- guarded Decision and Question delete actions
- editable Decision and Question content fields
- editable Final Answer / Final Decision fields
- editable Rationale and Resolution Notes
- lightweight prior-state resolution history
- scroll/accessibility fixes for reaching lower detail actions
- calmer editorial resolution layout with reduced stacked-card weight
- Question tier filtering and unobtrusive tier definitions
- Candidate Inbox filter/detail-scroll regression repair
- tooltip dismissal cleanup
- autosave/save-state footer and displayed timestamps standardized toward Central Time
- Decisions layout passed manual Electron smoke
- Questions layout passed manual Electron smoke
- Questions and Candidate filters passed manual Electron smoke
- Candidate second column scrolling passed manual Electron smoke
- tooltip dismissal passed manual Electron smoke
- explicit Central Time autosave/status timestamp passed manual Electron smoke
- visible Phase labels/listings were removed or reduced enough for now
- manual editorial authority preserved
- no automatic canon promotion or canon mutation

Future additions:
- richer linked-entity surfaces where existing patterns support them
- lightweight backlinks to decisions, questions, candidates, AI sessions, imported conversations, and story bible entries
- reconsider visible Phase labels/listings in the app UI only when they have clear editorial value
- prefer editorial labels such as status, canon state, review state, source/provenance, decision history, blockers/dependencies, and updated timestamp

### Future Phase — Canon Confidence / Editorial Attention

Goal:
Help the user see how settled, sourced, and risky material is while preserving manual authority.

Include:
- canon confidence levels: Confirmed Canon, Working Canon, Tentative, Exploratory, Rejected, Alternate, Unknown
- Accepted / Needs Placement organizational groups such as Future Episode, Season 1, Lore, Character Arc, Dialogue Ideas, Theme, Relationship, Twist, Canon Risk, Contradiction Risk, Maybe Later, Alternate Version, and Non-Canon Exploration
- Editorial Focus / Needs Attention dashboard layer
- auto-surfaced attention examples: unplaced accepted candidates, contradiction risks, unresolved questions, canon lacking provenance, imported sessions needing review, and timeline gaps
- task/dashboard surfaces derived from editorial state, not generic productivity workflows

### Future Phase — Continuity / Timeline Assistance

Goal:
Help surface continuity issues while keeping user authority.

Include:
- continuity reminders
- timeline references
- contradiction-risk visibility
- source-backed suggestions
- lightweight editorial-assistance contradiction review
- no autonomous canon changes
- no autonomous canon resolution
- no relationship inference as fact

### Future Phase — Creative Command Center Dashboard

Goal:
Evolve the dashboard into a calm creative command center rather than a productivity board.

Include:
- Continue Working
- Editorial Focus
- Creative Memory
- Story Status
- quiet surfaces for attention, provenance, and continuity confidence
- dashboard/task systems derived from editorial state rather than generic productivity workflows

### Future Phase — Audit / History Systems

Goal:
Make canon/editorial changes traceable and reversible where possible.

Include:
- decision history
- promotion history
- source backlinks
- provenance backlinks from decisions, questions, candidates, AI sessions, imported conversations, and story bible entries
- subtle, expandable provenance surfaces instead of graph-heavy or cluttered interfaces
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

### Long-Term Direction — Slugline Integration

Goal:
Let Revival Bible and Slugline complement each other without premature coupling.

Direction:
- Revival Bible remains the narrative memory, continuity, canon, provenance, and decision-history layer.
- Slugline remains the screenplay drafting and execution layer.
- Future integration may support continuity-aware screenplay drafting, screenplay-to-canon provenance linkage, and canon/context retrieval during drafting.
- Integration should be delayed until Revival's own data model, source archive, and canon authority flows are stable.

## Permanent Constraints

Do not build:
- autonomous AI agents
- automatic canon mutation
- automatic merging
- relationship inference as fact
- embeddings/vector systems unless deliberately approved later
- enterprise dashboards
- generic productivity dashboards
- generic to-do lists
- kanban boards
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
