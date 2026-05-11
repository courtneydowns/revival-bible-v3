# PATCH_CLASSES.md

# Revival Bible v3 — Patch Classes

## Patch Class: Layout Stabilization
Used for UI ergonomics, spacing, scrolling, and readability improvements that do not change core data architecture.

Examples:
- Candidates Inbox layout rebalancing
- reducing nested scrolling
- improving small-window usability
- making detail panels more readable

Rules:
- touch fewest files possible
- avoid redesigning the app
- avoid changing canon logic
- preserve existing workflows

## Patch Class: Candidate Workflow-State Refinement
Used for candidate review states and candidate queue usability.

Current planned use:
Phase 26B — Candidate Acceptance Queue

Purpose:
Allow a candidate to be marked Accepted / Needs Placement without promoting it into canon.

Allowed:
- candidate status additions
- filters/list/detail UI updates for candidate state
- persistence for candidate state if needed
- smoke checklist updates

Forbidden:
- automatic canon mutation
- automatic promotion
- merge systems
- AI classification
- embeddings/vector systems
- relationship inference
- graph systems
- large architecture rewrites

Core rule:
Acceptance is not promotion.

A candidate marked Accepted / Needs Placement remains a candidate until the user explicitly chooses a canon destination and promotes it.

## Output Control
Codex should work silently unless blocked.

Final response only:
- Files changed
- Root cause
- One sentence fix
- Build result
- Smoke result
- Unresolved blockers
