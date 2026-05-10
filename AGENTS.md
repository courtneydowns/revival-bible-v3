# Revival Bible v3 — Agent Instructions

## Project
Local-first Electron desktop app for the Revival story bible / continuity engine.

## Hard canon rules
- STORY_BIBLE_V4 is authoritative.
- Do not overwrite V4 canon with V3.
- Revival is locked as 3 seasons, 8 episodes each, 24 total episodes.
- No screenplay drafting systems yet.
- No AI/chat features yet unless explicitly approved.

## Safety rules
- Preserve existing data.
- No destructive migrations.
- No broad rewrites.
- Small safe phases only.
- Do not commit or push unless explicitly asked.
- Audit before patching.
- Patch only targeted files/issues.

## Standard workflow
Before coding:
1. Read AGENTS.md, docs/CURRENT_STATE.md, and docs/ACTIVE_SCOPE.md first.
2. Inspect relevant files before patching.
3. State smallest safe scope.
4. Identify assumptions/risks.
5. Keep changes to 1-4 files unless the task clearly requires more.
6. Do not touch high-risk areas unless docs/ACTIVE_SCOPE.md explicitly allows it.

High-risk areas:
- Search indexing.
- Persistence.
- Schema migrations.
- Large store rewrites.

Failed retests:
- Use a surgical debug loop.
- Reproduce the exact failure.
- Inspect the smallest relevant surface.
- Patch the smallest plausible cause.
- Rerun the exact failed retest before claiming progress.

After coding always run:
- git status --short
- git diff --stat
- npm run build

Final report must include:
1. Files changed
2. One sentence per fix
3. Exact smoke result
4. Exact build result
5. Unresolved blockers

No PASS claim is allowed without the exact retest that passed.

## Codex Output Rules

For all Codex tasks in this repo:

- Do not narrate your process while working.
- Do not provide step-by-step progress updates.
- Do not explain what you are about to do.
- Do not summarize files while still working.
- Do not paste large diffs or logs unless there is a blocking error.
- Do not output long reasoning paragraphs.

During execution, remain mostly silent unless blocked.

Final reports must contain ONLY:
1. Files changed
2. Root cause (if fixing a bug)
3. One sentence fix
4. Build result
5. Smoke result

Keep final reports under 120 words unless a blocker requires more.

## Token Management Rules

- Keep patches surgical and phase-scoped.
- Touch the fewest files possible.
- Prefer modifying existing systems over adding new architecture.
- Avoid unnecessary abstractions.
- Avoid broad rewrites during active phases.
- Use ACTIVE_SCOPE.md as the primary task boundary.
- Do not dump large diffs.
- Do not restate the entire task context in final reports.

## Workflow Stability Priorities

Prioritize:
- persistence reliability
- workflow smoothness
- keyboard usability
- focus retention
- low-friction iteration
- uncluttered layouts
- stable navigation

Avoid overengineering.

Do not proactively add:
- agents
- embeddings/vector systems
- orchestration layers
- autonomous workflows
- plugin systems
- cloud sync
- complex markdown rendering
unless explicitly requested by the active phase scope.


## Codex Output Rules

For all Codex tasks in this repo:

- Do not narrate your process while working.
- Do not provide step-by-step progress updates.
- Do not explain what you are about to do.
- Do not summarize files while still working.
- Do not paste large diffs or logs unless there is a blocking error.
- Do not output long reasoning paragraphs.

During execution, remain mostly silent unless blocked.

Final reports must contain ONLY:
1. Files changed
2. Root cause (if fixing a bug)
3. One sentence fix
4. Build result
5. Smoke result

Keep final reports under 120 words unless a blocker requires more.

## Token Management Rules

- Keep patches surgical and phase-scoped.
- Touch the fewest files possible.
- Prefer modifying existing systems over adding new architecture.
- Avoid unnecessary abstractions.
- Avoid broad rewrites during active phases.
- Use ACTIVE_SCOPE.md as the primary task boundary.
- Do not dump large diffs.
- Do not restate the entire task context in final reports.

## Workflow Stability Priorities

Prioritize:
- persistence reliability
- workflow smoothness
- keyboard usability
- focus retention
- low-friction iteration
- uncluttered layouts
- stable navigation

Avoid overengineering.

Do not proactively add:
- agents
- embeddings/vector systems
- orchestration layers
- autonomous workflows
- plugin systems
- cloud sync
- complex markdown rendering
unless explicitly requested by the active phase scope.

