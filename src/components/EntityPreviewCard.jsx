import CanonTagBadges from './CanonTagBadges.jsx';

export default function EntityPreviewCard({
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
}) {
  const metadata = meta.filter(Boolean);

  return (
    <button className={`entity-preview-card ${active ? 'selected' : ''} ${className}`} onClick={onSelect} type="button">
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
}
