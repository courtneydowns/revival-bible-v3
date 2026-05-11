# CURRENT_STATE.md

# Revival Bible v3 — Current State

## Product Identity

Revival Bible v3 is a continuity-aware narrative operating system and creative editorial environment for developing, reviewing, preserving, and promoting story material.

The app supports:
- permanent development history
- AI session workflows
- candidate extraction/review
- manual canon promotion
- provenance/source traceability
- editorial decision-making
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
- autosave important app state
- autobackup SQLite/database data
- create backups before risky migrations
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
- clarify status badges vs canon tags
- add tag/status management as its own build phase
- update search indexes after tag/status edits

### Editorial Workflow

Planned:
- manual merge/review tooling
- continuity/audit history
- decision tracking improvements
- timeline/continuity assistance
- calmer review interfaces
- compact, low-noise editorial UI

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
