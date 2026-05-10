import { useEffect } from 'react';
import { useRevivalStore } from '../store.js';
import AIPanel from './AIPanel.jsx';
import BibleSection from './BibleSection.jsx';
import CharacterRelationshipMap from './CharacterRelationshipMap.jsx';
import CharacterWorkspace from './CharacterWorkspace.jsx';
import ContextPacks from './ContextPacks.jsx';
import Dashboard from './Dashboard.jsx';
import DecisionTracker from './DecisionTracker.jsx';
import EpisodeGuide from './EpisodeGuide.jsx';
import FlanaganCompanion from './FlanaganCompanion.jsx';
import LivingDocuments from './LivingDocuments.jsx';
import NavRail from './NavRail.jsx';
import OutbreakTimeline from './OutbreakTimeline.jsx';
import QuestionsLog from './QuestionsLog.jsx';
import SearchModal from './SearchModal.jsx';
import SessionInterface from './SessionInterface.jsx';
import SettingsModal from './SettingsModal.jsx';
import StatusBar from './StatusBar.jsx';
import Toast from './Toast.jsx';
import TopBar from './TopBar.jsx';

const views = {
  dashboard: Dashboard,
  bible: BibleSection,
  episodes: EpisodeGuide,
  characters: CharacterWorkspace,
  'context-packs': ContextPacks,
  decisions: DecisionTracker,
  questions: QuestionsLog,
  session: SessionInterface,
  flanagan: FlanaganCompanion,
  'relationship-map': CharacterRelationshipMap,
  timeline: OutbreakTimeline,
  'living-docs': LivingDocuments
};

export default function AppShell() {
  const activeView = useRevivalStore((state) => state.activeView);
  const navMode = useRevivalStore((state) => state.navMode);
  const searchOpen = useRevivalStore((state) => state.searchOpen);
  const settingsOpen = useRevivalStore((state) => state.settingsOpen);
  const hydratePhaseOneData = useRevivalStore((state) => state.hydratePhaseOneData);
  const ActiveView = views[activeView] || Dashboard;

  useEffect(() => {
    hydratePhaseOneData();
  }, [hydratePhaseOneData]);

  return (
    <div className={`app-shell nav-${navMode} view-${activeView} ${['session', 'bible', 'living-docs'].includes(activeView) ? 'workspace-wide' : ''}`}>
      <NavRail />
      <main className="main-column">
        <TopBar />
        <section className="content">
          <ActiveView />
        </section>
        <StatusBar />
      </main>
      <aside className="right-panel">
        <AIPanel />
      </aside>
      {searchOpen ? <SearchModal /> : null}
      {settingsOpen ? <SettingsModal /> : null}
      <Toast />
    </div>
  );
}
