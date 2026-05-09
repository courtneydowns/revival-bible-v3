import { useRevivalStore } from '../store.js';
import StatusBadge from './StatusBadge.jsx';

export default function Dashboard() {
  const databaseInfo = useRevivalStore((state) => state.databaseInfo);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const characters = useRevivalStore((state) => state.characters);
  const characterRelationshipCount = useRevivalStore((state) => state.characterRelationshipCount);

  return (
    <section className="view">
      <div className="eyebrow">Phase 2 bible seed and navigation</div>
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
          <StatusBadge status={nodeTree.length ? 'ESTABLISHED' : 'NEEDED'} />
          <p className="muted">{nodeTree.length} bible nodes seeded from the Phase 2 structure.</p>
        </article>
        <article className="status-card">
          <strong>Characters</strong>
          <StatusBadge status="DEVELOPING" />
          <p className="muted">{characters.length} characters and {characterRelationshipCount} relationships seeded.</p>
        </article>
      </div>
      <div className="placeholder-block">
        Phase 2 seeds the read-only bible tree, character roster, and relationship map data. Episodes, decisions, questions, living documents, AI calls, exports, and editing remain deferred.
      </div>
    </section>
  );
}
