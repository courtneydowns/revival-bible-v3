import { useEffect } from 'react';
import { BookOpen, Brain, ChevronRight, CircleHelp, Clock3, FileStack, GitBranch, LayoutDashboard, Map, MessageSquareText, Network, Users } from 'lucide-react';
import { useRevivalStore } from '../store.js';

const STORY_BIBLE_TREE_ID = 'story-bible';

const items = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['bible', 'Story Bible', BookOpen],
  ['episodes', 'Episodes', FileStack],
  ['characters', 'Characters', Users],
  ['decisions', 'Decisions', GitBranch],
  ['questions', 'Questions', CircleHelp],
  ['session', 'Session', MessageSquareText],
  ['flanagan', 'Flanagan', Brain],
  ['relationship-map', 'Relationship Map', Network],
  ['timeline', 'Timeline', Clock3],
  ['living-docs', 'Living Docs', Map]
];

export default function NavRail() {
  const activeView = useRevivalStore((state) => state.activeView);
  const activeNodeId = useRevivalStore((state) => state.activeNodeId);
  const expandedNodes = useRevivalStore((state) => state.expandedNodes);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const loadNodeTree = useRevivalStore((state) => state.loadNodeTree);
  const setActiveView = useRevivalStore((state) => state.setActiveView);
  const setNodeExpanded = useRevivalStore((state) => state.setNodeExpanded);
  const toggleExpandedNode = useRevivalStore((state) => state.toggleExpandedNode);
  const selectNode = useRevivalStore((state) => state.selectNode);
  const storyBibleExpanded = expandedNodes.includes(STORY_BIBLE_TREE_ID);
  const showStoryBibleTree = storyBibleExpanded || activeView === 'bible';
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
    <nav className="nav-rail">
      <div className="brand">
        <div className="brand-title">Revival Bible v3</div>
        <div className="brand-subtitle">local story memory</div>
      </div>
      <div className="nav-list">
        {items.map(([id, label, Icon]) => {
          if (id !== 'bible') {
            return (
              <button
                className={`nav-button ${activeView === id ? 'active' : ''}`}
                key={id}
                onClick={() => setActiveView(id)}
                type="button"
              >
                <Icon size={17} />
                <span>{label}</span>
              </button>
            );
          }

          return (
            <div className="nav-tree-group" key={id}>
              <button
                className={`nav-button ${activeView === id ? 'active' : ''}`}
                onClick={async () => {
                  setActiveView(id);
                  if (!nodeTree.length) {
                    await loadNodeTree();
                  }
                  setNodeExpanded(STORY_BIBLE_TREE_ID, true);
                }}
                type="button"
              >
                <Icon size={17} />
                <span>{label}</span>
                <ChevronRight className={`nav-chevron ${showStoryBibleTree ? 'expanded' : ''}`} size={14} />
              </button>
              {showStoryBibleTree ? (
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
    </nav>
  );
}
