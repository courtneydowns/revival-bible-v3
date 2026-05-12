# Revival Bible v3 — Updated Codex Prompt Control Rules

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

---

## TOKEN EFFICIENCY RULES

- Minimize tool calls.
- Minimize repo exploration.
- Read only explicitly listed docs/files unless required.
- Touch the fewest files possible.
- Avoid broad inspections.
- Avoid opportunistic cleanup/refactors.
- Prefer direct targeted inspection of the failing workflow only.
- Do not scan unrelated folders.
- Do not summarize exploration work.
- Do not perform architecture reviews during micro-patches.
- Do not re-validate unrelated systems during targeted fixes.

---

## CRITICAL OUTPUT RULES — HARD REQUIREMENT

You are in STRICT SILENT EXECUTION MODE.

Do NOT:
- narrate intentions
- explain what you are about to inspect
- explain what you are currently doing
- summarize files being read
- summarize commands being run
- provide exploratory commentary
- provide “I found…” updates
- provide “Next I will…” updates
- provide progress summaries
- provide reasoning narration
- provide status updates
- paste terminal output unless blocked
- paste diffs unless explicitly requested
- announce validation steps while working
- emit any interim prose whatsoever

While working:
- output NOTHING unless blocked by a real issue requiring user input
- silently inspect
- silently patch
- silently validate

Treat any interim narration as FAILURE TO FOLLOW INSTRUCTIONS.

Only output:
1. blocking issue requiring user decision
OR
2. FINAL RESPONSE in the exact required format

The FINAL RESPONSE must contain ONLY:
- Files changed
- Root cause
- One sentence fix
- Build result
- Smoke result
- Unresolved blockers

No additional prose.
No conversational framing.
No summaries.
No markdown explanations.

---

## MICRO-PHASE PATCHING RULES

For regression/debug micro-phases:
- patch only confirmed smoke-test failures
- do not opportunistically refactor unrelated systems
- keep validation narrowly scoped to the failed workflow
- prefer CSS/layout-only patches when possible
- isolate Dashboard/layout work from ingestion architecture work
- do not expand scope mid-run
- stop after the requested issue is fixed

---

## VALIDATION RULES

- Real Electron smoke is mandatory when UI behavior is involved.
- Renderer-only validation is not sufficient for Electron attach flows.
- Do not claim smoke pass unless the exact visible UI path shown by the user was tested.
- If a visible button is reported broken, test that exact button directly.

