# Revival Bible v3 — Current State

## Completed
- Phase 1: Foundation scaffold.
- Phase 2: Bible structure, navigation, ledgers/maps/views.
- Phase 3B: Decision Tracker, Questions Log, Living Documents, renderers, DB seed logic.
- Phase 4: Search and cross-reference foundation.
- Phase 5A: Timeline / chronology foundation.
- Phase 5B: Character relationship foundation.
- Phase 5C: Canon tagging/linking infrastructure mostly complete.

## Active Phase 5C cleanup
Remaining focus:
- Search results should distinguish Tag Match, Status Match, and Text Match.
- Canon/search tags:
  canon, character, relationship, timeline, episode, unresolved, contradiction-risk, decision, question, location
- Statuses:
  developing, established, plus any others actually found in app data/code.
- Statuses should not appear in Searchable Tags.
- "contradiction risk" should match "contradiction-risk".
- Story Bible should collapse after every search result click, including Story Bible results.
- If "episode" has no tagged records, report clearly instead of showing plain text as Tag Match.

## Known preferences
- Keep UI uncluttered.
- Prefer master-detail layouts where details are visible beside lists.
- Do not require scrolling below long lists to see selected record details.
