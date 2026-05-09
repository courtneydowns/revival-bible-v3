import { BookOpen, Brain, CircleHelp, Clock3, FileStack, GitBranch, LayoutDashboard, Map, MessageSquareText, Network, Users } from 'lucide-react';
import { useRevivalStore } from '../store.js';

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
  const setActiveView = useRevivalStore((state) => state.setActiveView);

  return (
    <nav className="nav-rail">
      <div className="brand">
        <div className="brand-title">Revival Bible v3</div>
        <div className="brand-subtitle">local story memory</div>
      </div>
      <div className="nav-list">
        {items.map(([id, label, Icon]) => (
          <button
            className={`nav-button ${activeView === id ? 'active' : ''}`}
            key={id}
            onClick={() => setActiveView(id)}
            type="button"
          >
            <Icon size={17} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
