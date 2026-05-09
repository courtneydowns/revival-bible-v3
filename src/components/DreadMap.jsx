export default function DreadMap({ count = 0 }) {
  return (
    <article className="status-card">
      <strong>Dread Map</strong>
      <p className="muted">Rows: {count}. Phase 1 schema only.</p>
    </article>
  );
}
