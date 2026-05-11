import { useEffect, useState } from 'react';
import { BookOpen, Brain, Boxes, ChevronLeft, ChevronRight, CircleHelp, Clock3, FileStack, GitBranch, Inbox, LayoutDashboard, Map, MessageSquareText, Network, PanelLeftClose, PanelLeftOpen, Users } from 'lucide-react';
import { useRevivalStore } from '../store.js';

const STORY_BIBLE_TREE_ID = 'story-bible';

const items = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['bible', 'Story Bible', BookOpen],
  ['episodes', 'Episodes', FileStack],
  ['characters', 'Characters', Users],
  ['context-packs', 'Context Packs', Boxes],
  ['candidates', 'Candidates Inbox', Inbox],
  ['decisions', 'Decisions', GitBranch],
  ['questions', 'Questions', CircleHelp],
  ['session', 'AI Sessions', MessageSquareText],
  ['flanagan', 'Flanagan', Brain],
  ['relationship-map', 'Relationship Map', Network],
  ['timeline', 'Timeline', Clock3],
  ['living-docs', 'Living Docs', Map]
];

export default function NavRail() {
  const [tooltip, setTooltip] = useState(null);
  const activeView = useRevivalStore((state) => state.activeView);
  const navMode = useRevivalStore((state) => state.navMode);
  const activeNodeId = useRevivalStore((state) => state.activeNodeId);
  const expandedNodes = useRevivalStore((state) => state.expandedNodes);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const loadNodeTree = useRevivalStore((state) => state.loadNodeTree);
  const setActiveView = useRevivalStore((state) => state.setActiveView);
  const setNodeExpanded = useRevivalStore((state) => state.setNodeExpanded);
  const toggleNavMode = useRevivalStore((state) => state.toggleNavMode);
  const toggleExpandedNode = useRevivalStore((state) => state.toggleExpandedNode);
  const selectNode = useRevivalStore((state) => state.selectNode);
  const storyBibleExpanded = expandedNodes.includes(STORY_BIBLE_TREE_ID);
  const showTooltip = (label, event) => {
    if (navMode !== 'compact') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const navRect = event.currentTarget.closest('.nav-rail')?.getBoundingClientRect();
    setTooltip({
      label,
      top: rect.top + rect.height / 2,
      left: (navRect?.right || rect.right) + 10
    });
  };
  const hideTooltip = () => setTooltip(null);
  const sections = nodeTree.filter((node) => !node.parent_id);
  const childrenByParent = nodeTree.reduce((accumulator, node) => {
    if (!node.parent_id) return accumulator;
    accumulator[node.parent_id] = accumulator[node.parent_id] || [];
    accumulator[node.parent_id].push(node);
    return accumulator;
  }, {});

  useEffect(() => {
    if (!nodeTree.length) {
      loadNodeTree();
    }
  }, [loadNodeTree, nodeTree.length]);

  return (
    <nav className={`nav-rail ${navMode === 'compact' ? 'compact' : ''}`}>
      <div className="brand">
        {navMode === 'compact' ? (
          <div className="brand-mark">RB</div>
        ) : (
          <>
            <div className="brand-title">Revival Bible v3</div>
            <div className="brand-subtitle">local story memory</div>
          </>
        )}
        <button
          aria-label={navMode === 'compact' ? 'Expand navigation' : 'Collapse navigation'}
          className="nav-collapse-button"
          onClick={toggleNavMode}
          title={navMode === 'compact' ? 'Expand navigation' : 'Collapse navigation'}
          type="button"
        >
          {navMode === 'compact' ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>
      <div className="nav-list">
        {items.map(([id, label, Icon]) => {
          if (id !== 'bible') {
            return (
              <button
                className={`nav-button ${activeView === id ? 'active' : ''}`}
                data-tooltip={label}
                key={id}
                onClick={() => setActiveView(id)}
                onBlur={hideTooltip}
                onFocus={(event) => showTooltip(label, event)}
                onMouseEnter={(event) => showTooltip(label, event)}
                onMouseLeave={hideTooltip}
                title={label}
                type="button"
              >
                <Icon size={17} />
                <span className="nav-label">{label}</span>
              </button>
            );
          }

          return (
            <div className="nav-tree-group" key={id}>
              <div className={`nav-branch-row ${activeView === id ? 'active' : ''}`}>
                <button
                  className="nav-branch-label"
                  data-tooltip={label}
                  onClick={async () => {
                    setActiveView(id);
                    if (!nodeTree.length) {
                      await loadNodeTree();
                    }
                    if (!storyBibleExpanded) {
                      setNodeExpanded(STORY_BIBLE_TREE_ID, true);
                    }
                  }}
                  onBlur={hideTooltip}
                  onFocus={(event) => showTooltip(label, event)}
                  onMouseEnter={(event) => showTooltip(label, event)}
                  onMouseLeave={hideTooltip}
                  title={label}
                  type="button"
                >
                  <Icon size={17} />
                  <span className="nav-label">{label}</span>
                </button>
                <button
                  aria-label={storyBibleExpanded ? 'Collapse Story Bible' : 'Expand Story Bible'}
                  className="nav-branch-toggle"
                  onClick={async (event) => {
                    event.stopPropagation();
                    if (!nodeTree.length) {
                      await loadNodeTree();
                    }
                    toggleExpandedNode(STORY_BIBLE_TREE_ID);
                  }}
                  title={storyBibleExpanded ? 'Collapse Story Bible' : 'Expand Story Bible'}
                  type="button"
                >
                  {navMode === 'compact'
                    ? <ChevronLeft className="nav-chevron" size={14} />
                    : <ChevronRight className={`nav-chevron ${storyBibleExpanded ? 'expanded' : ''}`} size={14} />}
                </button>
              </div>
              {storyBibleExpanded && navMode !== 'compact' ? (
                <div className="bible-tree">
                  {sections.length ? sections.map((section) => {
                    const expanded = expandedNodes.includes(section.id);
                    const children = childrenByParent[section.id] || [];

                    return (
                      <div className="tree-section" key={section.id}>
                        <button
                          className={`tree-node top-level ${activeNodeId === section.id ? 'selected' : ''}`}
                          onClick={() => {
                            selectNode(section.id);
                            toggleExpandedNode(section.id);
                          }}
                          type="button"
                        >
                          <ChevronRight className={expanded ? 'expanded' : ''} size={14} />
                          <span>{section.title.replace('SECTION ', '')}</span>
                        </button>
                        {expanded ? (
                          <div className="tree-children">
                            {children.map((childNode) => (
                              <button
                                className={`tree-node child ${activeNodeId === childNode.id ? 'selected' : ''}`}
                                key={childNode.id}
                                onClick={() => selectNode(childNode.id)}
                                type="button"
                              >
                                <span>{childNode.title}</span>
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  }) : (
                    <div className="tree-empty">Bible sections are loading.</div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {tooltip ? (
        <span
          className="nav-tooltip floating"
          style={{ left: tooltip.left, top: tooltip.top }}
          aria-hidden="true"
        >
          {tooltip.label}
        </span>
      ) : null}
    </nav>
  );
}
