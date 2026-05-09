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
1. Inspect relevant files.
2. State smallest safe scope.
3. Identify assumptions/risks.

After coding always run:
- git status --short
- git diff --stat
- npm run build

Final report must include:
1. Changed files
2. What changed
3. Build result
4. Smoke test steps
5. Risks/assumptions
6. Whether commit/push was skipped
