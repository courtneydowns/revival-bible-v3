# PATCH_CLASSES.md

# Revival Bible v3 — Patch Classes

## Purpose

Patch classes help keep Codex work surgical, safe, and token-efficient.

## Class 1 — Docs-Only Patch

Use for:
- roadmap updates
- project-control doc updates
- smoke test checklists
- planning docs
- backlog alignment

Allowed:
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PATCH_CLASSES.md
- docs/PHASE_LEDGER.md
- docs/SMOKE_TESTS/

Forbidden:
- app code
- database migrations
- package changes

Build:
- npm run build usually not required unless app files are touched

Smoke:
- git diff confirms docs-only changes
- docs remain concise and aligned

## Class 2 — Surgical UI Polish

Use for:
- layout clarity
- low-noise labels
- empty states
- filter labeling
- visual state badges
- compact nav polish

Allowed:
- focused component file
- focused CSS file

Forbidden:
- data model changes unless explicitly required
- new workflows
- broad rewrites

Required:
- npm run build
- manual smoke of affected workflow

## Class 3 — Persistence / Data Safety Patch

Use for:
- autosave
- autobackup
- save reliability
- database backup before migrations
- recovery/export path
- destructive-action confirmations

Allowed:
- focused persistence/store/db files
- minimal UI feedback where required
- docs/smoke checklist updates

Required:
- backup/recovery smoke
- restart/navigation persistence smoke
- no silent failure path

Forbidden:
- broad data model rewrites without explicit phase scope
- automatic canon mutation

## Class 4 — Workflow Behavior Patch

Use for:
- candidate review workflow
- promotion workflow
- source-session navigation
- manual merge/review tooling

Required:
- preserve provenance
- preserve historical development records
- no canon mutation except explicit user action
- source navigation smoke

## Class 5 — Search / Tag / Status Patch

Use for:
- tag visibility
- status filtering
- search result clarity
- master tag list
- tag/status editing

Required:
- tag-vs-text distinction if search UI is involved
- persistence smoke if statuses/tags are editable
- search-index refresh if applicable

## Output Control

Codex should not provide:
- interim narration
- command narration
- repeated terminal output
- progress summaries
- exploratory explanations unless blocked

Final report only:
Files changed:
Root cause:
One sentence fix:
Build result:
Smoke result:
Unresolved blockers:
