import { ExternalLink } from 'lucide-react';
import { useRevivalStore } from '../store.js';

export default function PromotionProvenance({ text }) {
  const provenance = parsePromotionProvenance(text);
  const selectCandidate = useRevivalStore((state) => state.selectCandidate);
  const selectAiSession = useRevivalStore((state) => state.selectAiSession);

  if (!provenance) return null;

  return (
    <section className="promotion-provenance" aria-label="Promotion provenance">
      <div>
        <span>Promoted From</span>
        <strong>Candidate #{provenance.candidateId}</strong>
        <small>{provenance.promotedAt ? `Promoted ${formatDate(provenance.promotedAt)}` : 'Promotion date unknown'}</small>
      </div>
      <div className="promotion-provenance-actions">
        <button className="candidate-source-link" onClick={() => selectCandidate(provenance.candidateId)} type="button">
          <ExternalLink size={13} />
          <span>Open Candidate</span>
        </button>
        {provenance.sourceSessionId ? (
          <button className="candidate-source-link" onClick={() => selectAiSession(provenance.sourceSessionId)} type="button">
            <ExternalLink size={13} />
            <span>Open Source Session</span>
          </button>
        ) : null}
      </div>
    </section>
  );
}

export function parsePromotionProvenance(text = '') {
  const source = String(text || '');
  const match = source.match(/Promoted from Candidate #([^ ]+) \((.*?)\) to (.*?) on (.*?)\. Original source: ([^.]+)\./);
  if (!match) return null;

  const sourceSessionMatch = match[5].match(/AI Session #([^ ]+)/);
  return {
    candidateId: match[1],
    candidateTitle: match[2],
    targetLabel: match[3],
    promotedAt: match[4],
    originalSource: match[5],
    sourceSessionId: sourceSessionMatch?.[1] || ''
  };
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
