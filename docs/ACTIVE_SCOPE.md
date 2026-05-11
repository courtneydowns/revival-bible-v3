# ACTIVE_SCOPE.md

# Revival Bible v3 — Active Scope

## Current Phase
PHASE 26B — Candidate Acceptance Queue

## Current Goal
Add a non-canon candidate state for editorial items the user wants to keep and probably use later, but cannot or does not want to place into a canon destination yet.

## Product Rule
Nothing becomes canon automatically.

Candidate acceptance is not promotion.

An accepted candidate means:
- the candidate has editorial value
- the user wants to preserve it for future use
- the candidate is not yet assigned to Character, Location, Episode, Decision, Story Bible, or another canon destination
- no canon entity should be created or changed until the user explicitly promotes it

## Phase 26A Result
Phase 26A passed.

Completed:
- Candidate Inbox layout stabilized
- candidate navigator narrowed
- candidate list made independently scrollable
- right-side detail panel made calmer and more document-like
- nested/cramped scrolling reduced
- provenance/meta readability preserved
- Location promotion target reachability smoke-passed
- compact nav scrolling/tooltips smoke-passed

Deferred:
- promoted-candidate navigation was not directly re-smoked because no promoted candidate record existed in preview state

## Phase 26B Scope
Strictly implement candidate review-state workflow and light UI support.

Allowed:
- add an Accepted / Needs Placement candidate state
- expose the state in Candidates Inbox filters/list/detail UI
- let user mark a candidate as Accepted / Needs Placement without choosing a canon destination
- preserve source/provenance/history
- make accepted candidates easy to find later
- update smoke tests/checklists accordingly

Not allowed:
- automatic canon mutation
- automatic promotion
- auto-merging
- AI classification
- embeddings/vector systems
- relationship inference
- graph systems
- enterprise dashboards
- large navigation rewrites
- modal-heavy redesigns

## Acceptance Criteria
- User can mark a candidate as Accepted / Needs Placement.
- Accepted candidates remain candidates, not canon.
- Accepted candidates do not require destination selection.
- Candidate list/filtering makes accepted candidates easy to find.
- Provenance and source-session links remain intact.
- Existing New / Needs Review, Promoted, Rejected, and delete flows remain stable.
- Build passes.
- Manual smoke passes.

## Files Likely In Scope
- src/components/CandidateInbox.jsx
- src/store.js if candidate status persistence/state handling requires it
- src/index.css if UI styling is needed
- docs/ACTIVE_SCOPE.md
- docs/CURRENT_STATE.md
- docs/ROADMAP.md
- docs/PHASE_LEDGER.md
- docs/PATCH_CLASSES.md

## Output Control
No interim updates unless blocked.
Final report only:
- Files changed
- Root cause
- One sentence fix
- Build result
- Smoke result
- Unresolved blockers
