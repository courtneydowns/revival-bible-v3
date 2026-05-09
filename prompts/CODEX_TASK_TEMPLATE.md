Read AGENTS.md and docs/CURRENT_STATE.md.

Task:
[one sentence goal]

Context:
[only the files/features relevant to this task]

Requirements:
- [specific behavior]
- [specific behavior]
- Preserve existing passing behavior.

Do not:
- commit
- push
- perform broad rewrites
- add destructive migrations

Verify:
cd ~/Documents/revival-bible-v3
git status --short
git diff --stat
npm run build

Report:
1. changed files
2. what changed
3. build result
4. smoke test steps
5. risks/assumptions
