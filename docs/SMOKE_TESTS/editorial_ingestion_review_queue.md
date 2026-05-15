# Editorial Ingestion / Review Queue Smoke Test

Regression route:

1. Open Editorial Ingestion and switch to Source Material; the view should scroll/focus to the Source Material section top.
2. Confirm Source Material remains readable and laid out without crowding.
3. Stage or inspect Review Queue material; queue items should be visible directly without opening source batches.
4. Confirm source/batch labels act as provenance/context headers, not navigation gates.
5. Select a Review Queue card; selected card styling should be distinct from checkbox triage selection.
6. Confirm Review Queue checkboxes only indicate selection/triage and do not imply deletion.
7. Confirm cards remain collapsed/summary-style by default.
8. Confirm counters stay on one row, including `Visible Review Queue`.
9. Navigate to Review Detail and back; Dashboard, routing, and Review Detail behavior should remain stable.
10. In Source Material, confirm Stored Source Material behaves like a calm source library.
11. Search/filter by title/name, visible metadata, and preview/raw source text where available.
12. Change sort and confirm the sort control remains available and status copy reflects the active sort.
13. Confirm source cards show derived-only type/status/provenance badges.
14. With enough sources, confirm the list initially shows a limited set and Show More / Show Fewer works.
15. Confirm batch/session browsing supports All batches, specific batch/session filters, and Unbatched fallback where available.
16. Confirm existing source remove behavior and confirmation semantics are unchanged.
17. Confirm Review Queue, Review Detail, Dashboard, counters, store, database, and canon/review state logic remain unchanged.
18. Run `npm run build`.

Not-yet-implemented checks:

- No bulk Review Queue remove/delete workflow should appear.
- No individual safe Review Queue item deletion workflow should appear.
- No source batch archive/remove workflow should appear.
- No new safe source deletion/removal workflow should appear beyond existing behavior.
- Do not resume Review Queue micro-polish unless a concrete issue appears.
