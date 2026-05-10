import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function InspectorPanel({ kicker, title, meta, badges, status, children, emptyText = 'Select an item.', className = '', collapsed = false, onToggleCollapsed }) {
  const hasSelection = Boolean(title);

  return (
    <article className={`inspector-panel ${hasSelection ? 'selected-detail-panel' : ''} ${collapsed ? 'collapsed' : ''} ${className}`}>
      <div className="inspector-panel-header">
        {collapsed ? (
          <button className="icon-button inspector-toggle" onClick={onToggleCollapsed} title="Expand inspector" type="button">
            <ChevronLeft size={16} />
          </button>
        ) : (
          <>
            <div className="inspector-title-block">
              {kicker ? <div className="selection-kicker">{kicker}</div> : null}
              {meta ? <div className="inspector-meta">{meta}</div> : null}
              {title ? <h2>{title}</h2> : null}
              {badges}
            </div>
            <div className="inspector-header-actions">
              {status}
              {onToggleCollapsed ? (
                <button className="icon-button inspector-toggle" onClick={onToggleCollapsed} title="Collapse inspector" type="button">
                  <ChevronRight size={16} />
                </button>
              ) : null}
            </div>
          </>
        )}
      </div>
      {!collapsed ? (
        hasSelection ? (
          <div className="inspector-panel-body">{children}</div>
        ) : (
          <div className="placeholder-block">{emptyText}</div>
        )
      ) : null}
    </article>
  );
}
