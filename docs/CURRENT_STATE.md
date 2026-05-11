# CURRENT_STATE.md

# Revival Bible v3 — Current State

## Product Identity

Revival Bible v3 is a continuity-aware editorial operating system for developing, reviewing, preserving, and promoting story material.

It is also a permanent creative memory system, canon-management environment, provenance/archive layer, and decision-history system.

Its core differentiator is creative continuity confidence and creative memory retrieval.

It is not a generic to-do list, kanban board, enterprise dashboard, or productivity app.

It prioritizes creative state continuity: when reopening the project later, the user should immediately understand what matters, what is unresolved, what changed, what needs attention, what is risky, and where ideas originated.

The app supports:
- permanent development history
- AI session workflows
- candidate extraction/review
- manual canon promotion
- provenance/source traceability
- editorial decision-making
- creative memory retrieval
- canon confidence review
- recovery and recoverability
- story bible/canon organization

## Core Product Rule

Nothing becomes canon automatically.

The user remains authoritative.

The system may assist with:
- extraction
- review
- continuity
- provenance
- editorial organization
- structured promotion
- search
- source context
- workflow clarity

The system must not autonomously:
- mutate canon
- merge records
- infer relationships as fact
- classify story material into canon without review
- overwrite user-authored material silently

## Stable Systems

### AI Sessions

Stable:
- OpenAI generation works.
- Claude / Anthropic generation works.
- Sessions persist and reopen.
- Session history works.
- Copy Response works.
- Context Packs / Session Context workflow exists.
- Response reader supports extraction workflows.
- Source-session navigation from Candidates works.

### Candidate Inbox

Stable:
- Candidate Inbox foundation exists.
- Candidate Inbox queue organization improved.
- Queue labels/status summaries/counts exist.
- Candidate persistence works.
- Candidate delete flow works.
- Candidate editing works.
- Review notes persist.
- Manual extraction from AI responses works.
- Candidate provenance is preserved.
- Candidate source-session linking works.
- Candidate → canon promotion foundation exists.
- Promotion traceability/backlinking exists.
- Promoted candidates remain preserved as historical development records.
- Accepted / Needs Placement workflow exists.
- Accepted state persists correctly.
- Accepted candidates remain editable.
- Accepted candidates can still be promoted normally.
- Accepted candidates remain non-canon until explicit promotion.
- Accepted state clearly says: “Accepted for future placement. Not canon until promoted.”
- Pending, Accepted, Needs Placement, Promoted, and Rejected are clearer than before, with additional filtering/organization still planned.

### Navigation / Layout

Stable:
- Compact/collapsible left nav works.
- Compact nav state persists.
- Compact nav tooltips work.
- Nav rail scrolling works.
- AI Sessions layout is wider and less cramped.
- Candidate Inbox right-detail layout is stable.
- Candidate list/detail scrolling is stable.

### Promotion / Provenance

Stable:
- Promotion is manual.
- Promotion preserves provenance/history.
- Source session linking/jump behavior works.
- Existing promotion workflows still work.
- Candidate promotion does not automatically mutate canon except through explicit user action.

## Known Planned Improvements / Backlog Themes

### Candidate Queue Organization

Planned:
- organize Candidates Inbox by status
- add or improve status filtering similar to search filtering
- make Pending, Accepted, Needs Placement, Promoted, and Rejected easier to scan
- keep Promoted and Rejected accessible without crowding active review
- keep Accepted visibly non-canon until promoted
- improve empty states, counts, and queue clarity

### Data Safety / Persistence Hardening

Planned dedicated hardening:
- treat recovery, autosave, and recoverability as core product pillars
- autosave important app state
- autobackup SQLite/database data
- back up SQLite/database data before risky migrations
- add recovery/export path for canon data
- strengthen edit persistence
- prevent silent data loss
- confirm destructive actions
- smoke test persistence after navigation/restart
- verify data survives app reloads and workflow transitions

### Search / Tags / Status Management

Planned:
- clearer tag-vs-text search result distinction
- support natural searches like “contradiction risk” for contradiction-risk tags
- add a master tag list
- keep tag/status management as a future phase
- clarify status badges vs canon tags
- add tag/status management as its own build phase
- update search indexes after tag/status edits

### Editorial Workflow

Stable:
- Decision / Question resolution tracking foundation exists.
- Initial Phase 30 manual UI smoke exposed missing create controls, incomplete content editing, status persistence friction, and scrolling/accessibility gaps; the debug patch addresses those surfaces.
- Questions support Open, Tentatively Answered, Resolved, and Deprecated states.
- Decisions support Proposed, Accepted, Implemented, Reversed, and Deprecated states.
- Decisions and Questions have visible manual create controls.
- Decisions and Questions have calm delete actions with lightweight confirmation.
- Decision/Question content and resolution fields are editable from the detail panel.
- Final Answer / Final Decision, Rationale, and Resolution Notes are manually editable.
- Resolution statuses persist through explicit user action and remain manual editorial state.
- Resolution edits preserve prior state notes in a lightweight append-only history field.
- Phase 30 UI polish reduced stacked admin-card weight and moved the workflow closer to a calm editorial notebook.
- Questions have tier filtering and unobtrusive tier definitions for scanning.
- Decision tiers have brief meaning hints.
- Candidate Inbox filter behavior and detail-column scrolling were repaired after the Phase 30 polish regression.
- Nav tooltips dismiss reliably.
- Autosave/status footer now shows meaningful save state with Central Time timestamps.
- Resolution state does not promote anything to canon automatically.

Planned:
- manual merge/review tooling
- continuity/audit history
- deeper decision tracking improvements
- canon confidence levels: Confirmed Canon, Working Canon, Tentative, Exploratory, Rejected, Alternate, Unknown
- timeline/continuity assistance
- lightweight contradiction assistance, not autonomous canon resolution
- lightweight backlinks/provenance surfaces across decisions, questions, candidates, AI sessions, imported conversations, and story bible entries
- subtle, expandable provenance surfaces instead of graph-heavy or cluttered interfaces
- calmer review interfaces
- compact, low-noise editorial UI

### Creative Memory / Imported Conversations

Planned:
- Imported Conversations / Claude dump pipeline
- immutable source archive
- chunked reader for long imports
- immediate search over imported source text
- annotations, tags, and bookmarks
- manual extraction to Candidates
- manual promotion only
- classification categories such as Serious Canon Discussion, Canon Proposal, Working Canon, Canon Conflict, Exploratory Brainstorming, Wild Ideas, Alternate Timeline, Non-Canon Exploration, Continuity Review, Episode Planning, Arc Planning, Revisit Later, Joke/Throwaway, Research Notes, and Timeline Notes
- clear distinction between serious canon discussion, exploratory brainstorming, non-canon exploration, abandoned ideas, and joke/throwaway discussion
- preservation of historical creative evolution, including abandoned and alternate ideas, as long-term narrative memory

### Editorial Focus / Needs Attention

Planned:
- calm dashboard layer for Continue Working, Editorial Focus, Creative Memory, and Story Status
- dashboard/task systems derived from editorial state rather than generic productivity workflows
- Accepted / Needs Placement grouping such as Future Episode, Season 1, Lore, Character Arc, Dialogue Ideas, Theme, Relationship, Twist, Canon Risk, Contradiction Risk, Maybe Later, Alternate Version, and Non-Canon Exploration
- auto-surface unplaced accepted candidates, contradiction risks, unresolved questions, canon lacking provenance, imported sessions needing review, and timeline gaps

### Long-Term Slugline Direction

Planned:
- Revival Bible remains the narrative memory, continuity, provenance, canon, and decision-history layer.
- Slugline remains the screenplay drafting/execution layer.
- Future integration may support continuity-aware screenplay drafting, screenplay-to-canon provenance linkage, and canon/context retrieval during drafting.
- Avoid tight coupling until Revival's core authority, archive, and provenance systems are stable.

## Future Direction Priorities

Prioritize:
- continuity trust
- editorial confidence
- provenance
- recall
- recoverability
- low-friction creative workflows

Deprioritize:
- aggressive AI automation
- enterprise workflow complexity

## Workflow Rules for Future Phases

- Use surgical patches.
- Touch the fewest files possible.
- Preserve architecture.
- Use project-control docs.
- Use ACTIVE_SCOPE for the current task.
- Keep Codex prompts token-efficient.
- Use concise copy/paste blocks.
- Do not include malformed git commands.
- Do not include `git log -1 --oneline` in future command blocks.
- Generate only the Codex prompt unless the user explicitly asks for a ChatGPT handoff.
- Tell the user when commits should be pushed.

## Output Control Rule for Codex

Codex prompts should include:

No interim narration.
No command narration.
No repeated terminal output.
No progress summaries.
No exploratory explanations unless blocked.

Final report only:
Files changed:
Root cause:
One sentence fix:
Build result:
Smoke result:
Unresolved blockers:
