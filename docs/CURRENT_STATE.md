# Revival Bible v3 — Current State

Stable completed-phase summary only. Use docs/ACTIVE_SCOPE.md for current work.
Use docs/ROADMAP.md for future phase planning.

## Completed Phases
- Phase 1: Foundation scaffold.
- Phase 2: Bible structure, navigation, ledgers/maps/views.
- Phase 3A: Episode guide seed foundation with 24 locked season/episode records.
- Phase 3B: Decision Tracker, Questions Log, Living Documents, renderers, DB seed logic.
- Phase 4: Search and cross-reference foundation.
- Phase 5A: Timeline / chronology foundation.
- Phase 5B: Character relationship foundation.
- Phase 5C: Canon tagging and search clarity.
- Phase 6: Universal inspector foundation.
- Phase 7: Tag and status management.
- Phase 8: Passed navigation regressions for detail scroll reset, back navigation restoration, and scroll visibility.
- Phase 9: Context Packs foundation for reusable bundles of selected story-bible records, with local persistence and linked-record navigation.
- Phase 10: Context Packs can generate grouped, copyable session-context text from linked records without AI integrations.
- Phase 11: Session Context workflow foundation.
- Phase 12: Template editing and local custom prompt presets.
- Phase 13: Local AI provider configuration foundation.
- Phase 14: Provider persistence and validation polish.
- Phase 15: Single-response AI Session workflow can assemble Session Context + Template + user instructions, call OpenAI or Anthropic from Electron main, save the prompt/response locally, and reopen persisted sessions.
- Phase 16A: AI Sessions workflow polish, collapsible nav, compact nav tooltips, and provider generation checks.
- Phase 16B: Session Context / Context Packs workflow polish and editable generated prompts.
- Phase 16C: AI Sessions readability and response workflow polish.
- Phase 17: AI Session persistence and deletion workflow fixes.
- Phase 18: Candidate Inbox/editorial extraction workflow planning foundation.
- Phase 19: Candidate Inbox foundation.
- Phase 20: Manual extraction workflow from AI Sessions into Candidates.
- Phase 21: Candidate review notes and editing.
- Phase 22: Candidate source linking and review context.
- Phase 23: Structured promotion foundation.
- Phase 24: Promotion traceability and canon backlinking, plus nav scroll regression fix.

## Project Control Docs
- docs/ACTIVE_SCOPE.md: current task only.
- docs/CURRENT_STATE.md: stable completed architecture only.
- docs/PHASE_LEDGER.md: completed/pending phase status.
- docs/ROADMAP.md: future phase planning.
- docs/PATCH_CLASSES.md: allowed patch classes and output-control rules.
- docs/SMOKE_TESTS/: reusable smoke tests.

## Known Preferences
- Keep UI uncluttered.
- Prefer master-detail layouts where details are visible beside lists.
- Do not require scrolling below long lists to see selected record details.
- Preserve calm editorial workflows.
- Nothing becomes canon automatically.
