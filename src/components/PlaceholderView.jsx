export default function PlaceholderView({ eyebrow = 'Phase 1 Placeholder', title, children }) {
  return (
    <section className="view">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <div className="placeholder-block">
        {children || 'This workspace is scaffolded for a later phase.'}
      </div>
    </section>
  );
}
