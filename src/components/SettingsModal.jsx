import { useState } from 'react';
import { useRevivalStore } from '../store.js';
import ApiKeySetup from './ApiKeySetup.jsx';

export default function SettingsModal() {
  const closeSettings = useRevivalStore((state) => state.closeSettings);
  const [claudeKey, setClaudeKey] = useState('');
  const [openAiKey, setOpenAiKey] = useState('');

  const savePlaceholder = async () => {
    await window.revival?.config.setApiKey({ provider: 'claude', apiKey: claudeKey });
    await window.revival?.config.setApiKey({ provider: 'openai', apiKey: openAiKey });
    closeSettings();
  };

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="eyebrow">Settings</div>
        <h2>Provider Placeholders</h2>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="claude-key">Claude API key</label>
            <input id="claude-key" onChange={(event) => setClaudeKey(event.target.value)} placeholder="Optional in Phase 1" type="password" value={claudeKey} />
          </div>
          <div className="field">
            <label htmlFor="openai-key">OpenAI API key</label>
            <input id="openai-key" onChange={(event) => setOpenAiKey(event.target.value)} placeholder="Optional in Phase 1" type="password" value={openAiKey} />
          </div>
        </div>
        <ApiKeySetup />
        <div className="modal-actions">
          <button className="secondary-button" onClick={closeSettings} type="button">Close</button>
          <button className="primary-button" onClick={savePlaceholder} type="button">Save Placeholder</button>
        </div>
      </section>
    </div>
  );
}
