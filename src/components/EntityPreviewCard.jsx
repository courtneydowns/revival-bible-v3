import { forwardRef } from 'react';
import CanonTagBadges from './CanonTagBadges.jsx';

const EntityPreviewCard = forwardRef(function EntityPreviewCard({
  active = false,
  children,
  className = '',
  kicker,
  meta = [],
  onSelect,
  status,
  summary,
  tags = [],
  title,
  type = 'Entity'
}, ref) {
  const metadata = meta.filter(Boolean);

  return (
    <button className={`entity-preview-card ${active ? 'selected' : ''} ${className}`} onClick={(event) => onSelect?.(event)} ref={ref} type="button">
      <div className="entity-preview-topline">
        <span>{kicker || type}</span>
        {status}
      </div>
      <strong>{title}</strong>
      {metadata.length ? (
        <div className="entity-preview-meta">
          {metadata.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : null}
      <CanonTagBadges tags={tags} compact />
      {summary ? <p>{summary}</p> : null}
      {children}
    </button>
  );
});

export default EntityPreviewCard;
