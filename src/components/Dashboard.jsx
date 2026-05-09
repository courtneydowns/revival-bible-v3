import { useRevivalStore } from '../store.js';
import StatusBadge from './StatusBadge.jsx';

export default function Dashboard() {
  const databaseInfo = useRevivalStore((state) => state.databaseInfo);

  return (
    <section className="view">
      <div className="eyebrow">Phase 1 foundation build</div>
      <h1>Revival Bible v3</h1>
      <p className="dashboard-lede">
        Format: 3 seasons / 8 episodes each / 24 episodes total. This app is the local-first
        memory system for story bible state, decisions, characters, episodes, living documents,
        and future AI-assisted creative sessions.
      </p>
      <div className="card-grid">
        <article className="status-card">
          <strong>Database</strong>
          <StatusBadge status={databaseInfo.connected ? 'ESTABLISHED' : 'NEEDED'} />
          <p className="muted">SQLite schema initializes on launch.</p>
        </article>
        <article className="status-card">
          <strong>Story Source</strong>
          <StatusBadge status="PROVISIONAL" />
          <p className="muted">STORY_BIBLE_V4 is the source of truth, but seeding begins in Phase 2.</p>
        </article>
        <article className="status-card">
          <strong>AI Layer</strong>
          <StatusBadge status="DEVELOPING" />
          <p className="muted">Provider-neutral stubs are wired. No external calls are made.</p>
        </article>
      </div>
      <div className="placeholder-block">
        Story seeding starts in Phase 2. Phase 1 stops at scaffold, shell, schema, IPC, store, and UI foundation.
      </div>
    </section>
  );
}
