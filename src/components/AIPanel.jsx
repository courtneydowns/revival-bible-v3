import { useRevivalStore } from '../store.js';

const tabs = ['ask', 'draft', 'check'];

export default function AIPanel() {
  const aiPanelTab = useRevivalStore((state) => state.aiPanelTab);
  const setAiPanelTab = useRevivalStore((state) => state.setAiPanelTab);

  return (
    <section className="ai-panel">
      <div className="eyebrow">AI Panel</div>
      <h2>Provider Neutral</h2>
      <div className="tab-row">
        {tabs.map((tab) => (
          <button className={aiPanelTab === tab ? 'active' : ''} key={tab} onClick={() => setAiPanelTab(tab)} type="button">
            {tab}
          </button>
        ))}
      </div>
      <div className="placeholder-block">
        AI calls are disabled in Phase 1. The IPC surface returns safe placeholder responses.
      </div>
    </section>
  );
}
