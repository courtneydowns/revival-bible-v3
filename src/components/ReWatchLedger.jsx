export default function ReWatchLedger({ count = 0 }) {
  return (
    <article className="status-card">
      <strong>ReWatch Ledger</strong>
      <p className="muted">Rows: {count}. Phase 1 schema only.</p>
    </article>
  );
}
