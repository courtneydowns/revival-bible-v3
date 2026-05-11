# PHASE_LEDGER.md

# Revival Bible v3 — Phase Ledger

## Phase 25 — Promotion Coverage + Real-State Validation
Status: Passed

Summary:
Promotion coverage validated. Provenance/backlinking remained stable. Candidate permanence and candidate ↔ canon ↔ source navigation remained stable where promoted records existed.

Deferred polish:
Location discoverability/navigation exposure remained unclear and was carried forward.

## Phase 26A — Editorial Workspace Layout Stabilization
Status: Passed

Files changed:
- src/components/CandidateInbox.jsx
- src/index.css

Root cause:
Candidate Inbox used a wide left column plus nested fixed-height scrolling, compressing the editorial panel.

One sentence fix:
Narrowed the candidate navigator, added indexes, made the candidate list independently scrollable, and moved the detail panel back to document-style page scrolling.

Build result:
npm run build passed.

Smoke result:
Preview smoke passed for Candidates Inbox small-window layout, list scrolling, right-panel readability, provenance/meta readability, Location promotion target reachability, compact nav scrolling/tooltips.

Unresolved blockers:
Promoted-candidate navigation was not directly re-smoked because preview state had no promoted candidate record.

Classification:
PASS with one deferred verification.

## Phase 26B — Candidate Acceptance Queue
Status: Planned

Summary:
Add a non-canon Accepted / Needs Placement state so candidates can be approved for future placement without being promoted into canon immediately.

Core distinction:
Acceptance is not promotion.

Acceptance criteria:
- Accepted candidates remain candidates.
- Accepted candidates do not create or mutate canon records.
- Accepted candidates remain easy to find later.
- Provenance/source/history are preserved.
- Existing candidate review, promotion, rejection, and deletion flows remain stable.
