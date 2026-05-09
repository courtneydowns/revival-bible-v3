import { useRevivalStore } from '../store.js';
import PlaceholderView from './PlaceholderView.jsx';

export default function DecisionTracker() {
  const decisions = useRevivalStore((state) => state.decisions);

  return (
    <PlaceholderView title="Decision Tracker">
      Decision tiers, blocker arrays, and lock fields exist in SQLite. Phase 1 has {decisions.length} decisions.
    </PlaceholderView>
  );
}
