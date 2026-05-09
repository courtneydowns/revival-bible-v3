export default function StatusBadge({ status = 'DEVELOPING' }) {
  const normalized = String(status).toLowerCase();
  return <span className={`status-badge ${normalized}`}>{String(status).toUpperCase()}</span>;
}
