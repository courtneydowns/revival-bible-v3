export default function StatusBadge({ status = 'DEVELOPING' }) {
  const label = String(status || 'PROVISIONAL');
  const className = label.toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
  const displayLabel = label.replace(/[-_]/g, ' ').toUpperCase();

  return <span className={`status-badge ${className}`}>{displayLabel}</span>;
}
