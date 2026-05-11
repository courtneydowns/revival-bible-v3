# ROADMAP.md

# Revival Bible v3 — Roadmap

## Recently Completed

### Phase 25 — Promotion Coverage + Real-State Validation
Status: Passed

Validated and stabilized promotion destinations in real app/editorial workflows.

### Phase 26A — Editorial Workspace Layout Stabilization
Status: Passed

Improved Candidates Inbox long-form editorial usability by reducing cramped nested scrolling and making the detail workspace calmer and more document-like.

Completed:
- candidate navigator narrowed
- candidate list independently scrollable
- right detail panel returned to document-style page scrolling
- provenance/meta readability preserved
- Location promotion target reachability verified
- compact nav scrolling/tooltips verified

Deferred:
- promoted-candidate navigation direct retest because preview state had no promoted candidate record

## Next Phase

### Phase 26B — Candidate Acceptance Queue
Status: Planned

Goal:
Add an Accepted / Needs Placement state so the user can mark a candidate as worth keeping without promoting it to Character, Location, Episode, Decision, Story Bible, or another canon destination yet.

Why:
Sometimes the user knows a candidate matters but does not yet know where it belongs. Sometimes the user wants to keep it for later but does not have time to place it during the current review session.

Core rule:
Accepted candidates are not canon.

Scope:
- add Accepted / Needs Placement status
- allow marking candidates accepted without selecting a destination
- make accepted candidates easy to find/filter later
- preserve all provenance/source/history links
- keep master-detail workflow stable

Do not add:
- automatic canon mutation
- auto-promotion
- auto-merge
- AI classification
- embeddings/vector systems
- relationship inference
- graph systems
- enterprise dashboards

## Future Candidate Workflow Ideas
- batch acceptance
- saved review queues
- better destination suggestions while keeping placement manual
- candidate aging/staleness indicators
- candidate grouping by source session
- richer placement checklist
