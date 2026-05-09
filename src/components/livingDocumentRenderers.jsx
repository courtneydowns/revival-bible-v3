import StatusBadge from './StatusBadge.jsx';

export function LivingDocumentEntryList({ entries = [], emptyLabel }) {
  if (!entries.length) {
    return <div className="placeholder-block">{emptyLabel}</div>;
  }

  return (
    <div className="living-entry-list">
      {entries.map((entry) => (
        <article className="living-entry" key={entry.id}>
          <div className="phase3b-card-topline">
            <span>Entry {entry.entry_number || entry.id}</span>
            <StatusBadge status={entry.status} />
          </div>
          <div className="living-field-grid">
            {Object.entries(parseFields(entry.fields)).map(([key, value]) => (
              <div className="field-card" key={key}>
                <strong>{formatLabel(key)}</strong>
                <p>{value || 'Pending.'}</p>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

function parseFields(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function formatLabel(key) {
  return key
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
