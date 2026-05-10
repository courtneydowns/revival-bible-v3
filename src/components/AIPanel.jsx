import { MessageSquareText } from 'lucide-react';
import { useRevivalStore } from '../store.js';

export default function AIPanel() {
  const aiSessions = useRevivalStore((state) => state.aiSessions);
  const activeAiSession = useRevivalStore((state) => state.activeAiSession);
  const setActiveView = useRevivalStore((state) => state.setActiveView);
  const selectAiSession = useRevivalStore((state) => state.selectAiSession);

  return (
    <section className="ai-panel">
      <div className="eyebrow">AI Panel</div>
      <h2>AI Sessions</h2>
      <button className="primary-button ai-session-open" onClick={() => setActiveView('session')} type="button">
        <MessageSquareText size={15} />
        <span>Open AI Sessions</span>
      </button>
      <div className="ai-panel-summary">
        <span>Saved sessions</span>
        <strong>{aiSessions.length}</strong>
      </div>
      <div className="ai-panel-history">
        {aiSessions.slice(0, 5).map((session) => (
          <button
            className={activeAiSession?.id === session.id ? 'selected' : ''}
            key={session.id}
            onClick={() => selectAiSession(session.id)}
            type="button"
          >
            <span>{session.provider || 'provider'}</span>
            <small>{session.model || 'model unset'}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
