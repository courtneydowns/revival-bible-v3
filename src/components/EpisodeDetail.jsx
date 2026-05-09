import { useRevivalStore } from '../store.js';
import StatusBadge from './StatusBadge.jsx';

export default function EpisodeDetail({ episode }) {
  const storeSelectedEpisode = useRevivalStore((state) => state.selectedEpisode);
  const selectedEpisode = episode || storeSelectedEpisode;

  if (!selectedEpisode) {
    return (
      <article className="detail-panel">
        <h2>Select an episode</h2>
        <p className="muted">Choose an episode card to inspect seeded Phase 3A fields.</p>
      </article>
    );
  }

  const acts = parseActs(selectedEpisode.acts);

  return (
    <article className="detail-panel episode-detail">
      <div className="document-header">
        <div>
          <div className="eyebrow">S{selectedEpisode.season}E{selectedEpisode.episode_number}</div>
          <h2>{selectedEpisode.title || 'Untitled'}</h2>
          <p className="muted">{selectedEpisode.na_tradition || 'NA tradition pending'}</p>
        </div>
        <StatusBadge status={selectedEpisode.status} />
      </div>

      <dl className="metadata-grid">
        <div>
          <dt>Dual Meaning</dt>
          <dd>{selectedEpisode.dual_meaning || 'Pending.'}</dd>
        </div>
        <div>
          <dt>Thematic Core</dt>
          <dd>{selectedEpisode.thematic_core || 'Pending.'}</dd>
        </div>
        <div>
          <dt>Acts</dt>
          <dd>{acts.length ? JSON.stringify(acts) : '[]'}</dd>
        </div>
      </dl>

      <Section title="Arc Summary" value={selectedEpisode.arc_summary} />
      <Section title="Cold Open" value={selectedEpisode.cold_open} />
      <Section title="Flanagan Moment" value={selectedEpisode.flanagan_moment} />
      <Section title="Rewatch Notes" value={selectedEpisode.rewatch_notes} />
    </article>
  );
}

function Section({ title, value }) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <p>{value || 'Pending.'}</p>
    </section>
  );
}

function parseActs(value) {
  try {
    const acts = JSON.parse(value || '[]');
    return Array.isArray(acts) ? acts : [];
  } catch {
    return [];
  }
}
