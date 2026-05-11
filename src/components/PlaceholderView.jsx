export default function PlaceholderView({ eyebrow = 'Planned Workspace', title, children }) {
  return (
    <section className="view">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <div className="placeholder-block">
        {children || 'This workspace is scaffolded for a later implementation pass.'}
      </div>
    </section>
  );
}
