import { useRevivalStore } from '../store.js';
import PlaceholderView from './PlaceholderView.jsx';

export default function EpisodeGuide() {
  const episodes = useRevivalStore((state) => state.episodes);

  return (
    <PlaceholderView title="Episode Guide">
      The locked format is 3 seasons, 8 episodes each, 24 total. Phase 1 has {episodes.length} episode rows.
    </PlaceholderView>
  );
}
