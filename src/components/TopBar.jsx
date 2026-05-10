import { ArrowLeft, Search, Settings } from 'lucide-react';
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
  const navigationHistory = useRevivalStore((state) => state.navigationHistory);
  const goBack = useRevivalStore((state) => state.goBack);
  const openSearch = useRevivalStore((state) => state.openSearch);
  const openSettings = useRevivalStore((state) => state.openSettings);

  return (
    <header className="top-bar">
      <div>
        <div className="top-title">{titles[activeView] || 'Revival Bible v3'}</div>
        <div className="muted">{hasUnsaved ? 'Unsaved local changes' : 'Phase 1 foundation'}</div>
      </div>
      <div className="top-actions">
        <button
          aria-label="Back"
          className="icon-button"
          disabled={!navigationHistory.length}
          onClick={goBack}
          title="Back"
          type="button"
        >
          <ArrowLeft size={17} />
        </button>
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
