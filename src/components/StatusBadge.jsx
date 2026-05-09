export default function StatusBadge({ status = 'DEVELOPING' }) {
  const allowed = ['LOCKED', 'ESTABLISHED', 'DEVELOPING', 'NEEDED', 'PROVISIONAL'];
  const label = String(status || 'PROVISIONAL').toUpperCase();
  const safeLabel = allowed.includes(label) ? label : label;

  return <span className={`status-badge ${safeLabel.toLowerCase()}`}>{safeLabel}</span>;
}
