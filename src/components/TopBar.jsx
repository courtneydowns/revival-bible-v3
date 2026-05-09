import { Search, Settings } from 'lucide-react';
import { useRevivalStore } from '../store.js';

const titles = {
  dashboard: 'Dashboard',
  bible: 'Story Bible',
  episodes: 'Episode Guide',
  characters: 'Character Workspace',
  decisions: 'Decision Tracker',
  questions: 'Questions Log',
  session: 'Session Interface',
  flanagan: 'Flanagan Companion',
  'relationship-map': 'Relationship Map',
  timeline: 'Outbreak Timeline',
  'living-docs': 'Living Documents'
};

export default function TopBar() {
  const activeView = useRevivalStore((state) => state.activeView);
  const hasUnsaved = useRevivalStore((state) => state.hasUnsaved);
  const openSearch = useRevivalStore((state) => state.openSearch);
  const openSettings = useRevivalStore((state) => state.openSettings);

  return (
    <header className="top-bar">
      <div>
        <div className="top-title">{titles[activeView] || 'Revival Bible v3'}</div>
        <div className="muted">{hasUnsaved ? 'Unsaved local changes' : 'Phase 1 foundation'}</div>
      </div>
      <div className="top-actions">
        <button aria-label="Search" className="icon-button" onClick={openSearch} title="Search" type="button">
          <Search size={17} />
        </button>
        <button aria-label="Settings" className="icon-button" onClick={openSettings} title="Settings" type="button">
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
