export default function CanonTagBadges({ tags = [] }) {
  if (!tags.length) return null;

  return (
    <div className="canon-tag-row" aria-label="Canon tags">
      {tags.map((tag) => (
        <span className={`canon-tag color-${tag.color || 'default'}`} key={`${tag.slug}-${tag.note || ''}`} title={tag.note || tag.description || tag.label}>
          {tag.label}
        </span>
      ))}
    </div>
  );
}
