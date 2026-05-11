import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import PromotionProvenance from './PromotionProvenance.jsx';
import StatusBadge from './StatusBadge.jsx';

export function LivingDocumentEntryList({ activeEntryId, entries = [], emptyLabel }) {
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);

  if (!entries.length) {
    return <div className="placeholder-block">{emptyLabel}</div>;
  }

  return (
    <div className="living-entry-list">
      {entries.map((entry) => {
        const fields = parseFields(entry.fields);

        return (
          <article className={`living-entry ${String(entry.id) === String(activeEntryId) ? 'selected' : ''}`} key={entry.id}>
            <div className="phase3b-card-topline">
              <span>Entry {entry.entry_number || entry.id}</span>
              <StatusBadge status={entry.status} />
            </div>
            <CanonTagBadges tags={entityTagsByKey[`living_document:${entry.id}`] || []} />
            <div className="living-field-grid">
              {Object.entries(fields).map(([key, value]) => (
                <div className="field-card" key={key}>
                  <strong>{formatLabel(key)}</strong>
                  <p>{value || 'Pending.'}</p>
                </div>
              ))}
            </div>
            <PromotionProvenance text={fields.provenance} />
          </article>
        );
      })}
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
