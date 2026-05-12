# Revival Bible v3 — Micro-Phase Workflow Doc Updates

Apply the following additions/updates to the project-control docs.

---

# AGENTS.md — Add Section

## MICRO-PHASE WORKFLOW RULES

For mature/editorial-stability phases:
- Separate architecture work from regression fixes.
- Separate regression fixes from UI polish/layout cleanup.
- Prefer smaller lettered micro-phases:
  - Phase 42A
  - Phase 42B
  - Phase 42C
  etc.
- Keep debug prompts surgical.
- Minimize files touched per patch.
- Avoid combining architecture, layout, persistence, Dashboard, Electron glue, and UX polish into one patch unless absolutely necessary.

Preferred structure:
- Main phase = architecture/workflow
- A-pass = smoke/regression fixes
- B-pass = UI/layout cleanup
- C-pass = optional polish/accessibility

Goals:
- shorter Codex runtimes
- lower regression risk
- faster smoke loops
- cleaner rollback boundaries
- smaller diffs
- easier manual smoke validation

For UI/layout micro-phases:
- prefer CSS/layout-only patches when possible
- avoid touching persistence/store architecture unless required
- isolate Dashboard/layout work from ingestion architecture work

For regression/debug micro-phases:
- patch only confirmed smoke-test failures
- do not opportunistically refactor unrelated systems
- keep validation narrowly scoped to the failed workflow

---

# docs/CURRENT_STATE.md — Add Note

## Workflow Direction

Revival Bible v3 has transitioned from foundational architecture work into editorial workflow stabilization and refinement.

Future development should prefer:
- smaller surgical phases
- shorter Codex runtimes
- isolated regression/debug passes
- dedicated UI/layout polish passes
- minimal-file-touch workflows

The preferred pattern is:
- major phase = architecture/workflow
- lettered micro-phase = regression fix or polish pass

Example:
- Phase 42 = extraction triage architecture
- Phase 42A = attachment/debug fixes
- Phase 42B = footer/status cleanup
- Phase 42C = Dashboard overflow polish

This structure reduces regression risk and improves smoke-test clarity.

---

# docs/ROADMAP.md — Optional Addendum

## Development Workflow Note

As the application matures, future phases should favor:
- smaller scoped implementation passes
- isolated UI/layout cleanup phases
- targeted regression/debug loops
- architecture-first then polish-second workflows

Large combined "feature + persistence + Dashboard + UX polish" phases should be avoided where possible.
