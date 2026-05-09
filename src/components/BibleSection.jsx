import { useRevivalStore } from '../store.js';
import PlaceholderView from './PlaceholderView.jsx';

export default function BibleSection() {
  const nodeTree = useRevivalStore((state) => state.nodeTree);

  return (
    <PlaceholderView title="Story Bible">
      Story bible navigation is ready. Seeded nodes arrive in Phase 2. Current node count: {nodeTree.length}.
    </PlaceholderView>
  );
}
