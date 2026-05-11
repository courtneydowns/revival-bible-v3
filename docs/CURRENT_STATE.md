# CURRENT_STATE.md

# Revival Bible v3 — Current State

## Stable Baseline
Revival Bible v3 is a continuity-aware narrative operating system with editorial review workflows, AI session history, candidate review, manual promotion, source provenance, and canon traceability.

## Current Stable Capabilities
- Candidate Inbox foundation exists and is stable.
- Manual extraction from AI Sessions works.
- Candidate provenance is preserved.
- Candidate permanence is preserved.
- Candidate ↔ canon ↔ source navigation is stable where promoted records exist.
- Promotion coverage has been validated.
- Promotion provenance/backlinking is stable.
- OpenAI generation works.
- Claude / Anthropic generation works.
- npm run build passes as of Phase 26A.

## Phase 26A State
Phase 26A passed.

Candidate Inbox layout is now calmer and more usable:
- left navigator is narrower and index-oriented
- candidate list scrolls independently
- right detail panel uses more natural document-style page scrolling
- cramped nested scrolling has been reduced
- provenance/meta sections remain readable
- small-window layout smoke-passed
- Location promotion target reachability smoke-passed

Known deferred verification:
- promoted-candidate navigation was not directly re-smoked because no promoted candidate record existed in preview state

## Candidate Workflow Direction
Candidate review now needs a pre-promotion accepted state.

Planned Phase 26B concept:
- Accepted / Needs Placement

Meaning:
- the candidate is editorially approved to keep
- the user likely wants to add it later
- the final destination is not yet known or the user does not have time to place it yet
- the candidate remains non-canon until explicitly promoted

## Important Distinction
Acceptance is not promotion.

Promotion means:
- the user chooses a canon destination
- a canon record is created or updated intentionally
- provenance/backlinks are preserved

Acceptance means:
- the user marks a candidate as worth keeping
- no canon record is created
- no canon state changes
- the candidate remains in the review workflow for later placement

## Product Rule
Nothing becomes canon automatically.
