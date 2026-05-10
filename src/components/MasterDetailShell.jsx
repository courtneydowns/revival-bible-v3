export default function MasterDetailShell({ className = '', listLabel, list, inspector }) {
  return (
    <div className={`master-detail-shell ${className}`}>
      <aside className="master-list-panel" aria-label={listLabel}>
        {list}
      </aside>
      {inspector}
    </div>
  );
}
