export default function MasterDetailShell({ className = '', listLabel, list, inspector, listRef }) {
  return (
    <div className={`master-detail-shell ${className}`}>
      <aside className="master-list-panel" aria-label={listLabel} ref={listRef}>
        {list}
      </aside>
      {inspector}
    </div>
  );
}
