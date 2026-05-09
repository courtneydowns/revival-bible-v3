import { useRevivalStore } from '../store.js';
import StatusBadge from './StatusBadge.jsx';

export default function Dashboard() {
  const databaseInfo = useRevivalStore((state) => state.databaseInfo);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const characters = useRevivalStore((state) => state.characters);
  const episodes = useRevivalStore((state) => state.episodes);
  const decisions = useRevivalStore((state) => state.decisions);
  const questions = useRevivalStore((state) => state.questions);
  const livingDocs = useRevivalStore((state) => state.livingDocs);
  const characterRelationshipCount = useRevivalStore((state) => state.characterRelationshipCount);
  const livingFrameworkCount = Object.values(livingDocs).filter((entries) => entries.length > 0).length;

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
        <article className="status-card">
          <strong>Episodes</strong>
          <StatusBadge status={episodes.length === 24 ? 'ESTABLISHED' : 'NEEDED'} />
          <p className="muted">{episodes.length} of 24 locked episode slots seeded.</p>
        </article>
        <article className="status-card">
          <strong>Decisions</strong>
          <StatusBadge status={decisions.length === 15 ? 'ESTABLISHED' : 'NEEDED'} />
          <p className="muted">{decisions.length} of 15 pre-writing decisions seeded.</p>
        </article>
        <article className="status-card">
          <strong>Questions</strong>
          <StatusBadge status={questions.length === 49 ? 'ESTABLISHED' : 'NEEDED'} />
          <p className="muted">{questions.length} of 49 open questions seeded.</p>
        </article>
        <article className="status-card">
          <strong>Living Documents</strong>
          <StatusBadge status={livingFrameworkCount === 4 ? 'ESTABLISHED' : 'NEEDED'} />
          <p className="muted">{livingFrameworkCount} of 4 framework types seeded.</p>
        </article>
      </div>
      <div className="placeholder-block">
        Phase 3B adds read-only decisions, questions, and living document frameworks. Editing, autosave, AI calls, exports, and Phase 4 remain deferred.
      </div>
    </section>
  );
}
