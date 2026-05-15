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
10. Run `npm run build`.

Not-yet-implemented checks:

- No bulk Review Queue remove/delete workflow should appear.
- No individual safe Review Queue item deletion workflow should appear.
- No safe source material removal, batch archive, or batch removal workflow should appear.
