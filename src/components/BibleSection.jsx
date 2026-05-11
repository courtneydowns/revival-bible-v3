import { useRevivalStore } from '../store.js';
import PromotionProvenance from './PromotionProvenance.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function BibleSection() {
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const selectedNode = useRevivalStore((state) => state.selectedNode);
  const selectedNodeContent = useRevivalStore((state) => state.selectedNodeContent);

  if (!selectedNode) {
    return (
      <section className="view bible-view">
        <div className="eyebrow">Story Bible</div>
        <h1>Select a bible section</h1>
        <div className="placeholder-block">
          The live bible tree is loaded from SQLite. Expand Story Bible in the NavRail and choose a section or subsection.
          Current node count: {nodeTree.length}.
        </div>
      </section>
    );
  }

  const parent = selectedNode.parent_id ? nodeTree.find((node) => node.id === selectedNode.parent_id) : null;
  const metadata = parseMetadata(selectedNode.metadata);

  return (
    <section className="view bible-view">
      <div className="eyebrow">Story Bible / Read Only</div>
      <div className="document-header">
        <div>
          <h1>{selectedNode.title}</h1>
          <p className="muted">{parent ? parent.title : 'Top-level bible section'}</p>
        </div>
        <StatusBadge status={selectedNode.status} />
      </div>
      <dl className="metadata-grid">
        <div>
          <dt>Type</dt>
          <dd>{selectedNode.node_type}</dd>
        </div>
        <div>
          <dt>Position</dt>
          <dd>{selectedNode.position ?? 'n/a'}</dd>
        </div>
        <div>
          <dt>Metadata</dt>
          <dd>{Object.keys(metadata).length ? JSON.stringify(metadata) : '{}'}</dd>
        </div>
      </dl>
      <article className="read-only-content">
        {(selectedNodeContent?.content || 'No content seeded for this node yet.')
          .split('\n')
          .map((line, index) => (
            <p key={`${selectedNode.id}-${index}`}>{line || '\u00a0'}</p>
          ))}
      </article>
      <PromotionProvenance text={selectedNodeContent?.content} />
    </section>
  );
}

function parseMetadata(value) {
  try {
    return JSON.parse(value || '{}');
  } catch {
    return {};
  }
}
