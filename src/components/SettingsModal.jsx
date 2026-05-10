import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';

const providers = [
  ['openai', 'OpenAI'],
  ['anthropic', 'Claude / Anthropic']
];

export default function SettingsModal() {
  const closeSettings = useRevivalStore((state) => state.closeSettings);
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState({ anthropic: '', openai: '' });
  const [apiKeySaved, setApiKeySaved] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [connectionTest, setConnectionTest] = useState({ status: 'idle', message: '' });
  const connectionTestInFlight = useRef(false);
  const selectedProviderLabel = useMemo(
    () => providers.find(([id]) => id === provider)?.[1] || 'AI provider',
    [provider]
  );

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      const preferences = await window.revival?.config.getPreferences();
      const keyStatus = await loadApiKeyStatus();
      if (!active || !preferences) return;

      setProvider(preferences.aiProvider || 'openai');
      setModels({
        anthropic: preferences.aiModels?.anthropic || '',
        openai: preferences.aiModels?.openai || ''
      });
      setApiKeySaved(keyStatus);
      setLoading(false);
    }

    loadSettings();
    return () => {
      active = false;
    };
  }, []);

  const saveSettings = async () => {
    if (loading) return;

    const savedSettings = await persistCurrentSettings();
    setApiKeySaved(savedSettings.apiKeySaved);
    setModels(savedSettings.models);
    setConnectionTest({ status: 'idle', message: '' });
    setMessage('AI provider settings saved locally.');
  };

  const persistCurrentSettings = async () => {
    let apiKeyResponse = null;
    const nextModels = {
      ...models,
      [provider]: models[provider] || ''
    };

    if (apiKey.trim()) {
      apiKeyResponse = await window.revival?.config.setApiKey({ provider, apiKey });
      setApiKey('');
    }

    const preferences = await window.revival?.config.setPreferences({
      aiProvider: provider,
      aiModels: nextModels
    });
    const keyStatus = await loadApiKeyStatus();

    return {
      apiKeySaved: {
        ...keyStatus,
        ...(apiKeyResponse?.apiKeySaved || {})
      },
      models: {
        anthropic: preferences?.aiModels?.anthropic || nextModels.anthropic,
        openai: preferences?.aiModels?.openai || nextModels.openai
      }
    };
  };

  const testConnection = async () => {
    if (loading || connectionTest.status === 'loading' || connectionTestInFlight.current) return;

    connectionTestInFlight.current = true;
    setMessage('');
    setConnectionTest({ status: 'idle', message: '' });

    try {
      const savedSettings = await persistCurrentSettings();
      setApiKeySaved(savedSettings.apiKeySaved);
      setModels(savedSettings.models);
      setConnectionTest({ status: 'loading', message: `Testing ${selectedProviderLabel} connection...` });

      await new Promise((resolve) => setTimeout(resolve, 100));
      const response = await window.revival?.config.testProviderConnection(provider);
      setConnectionTest({
        status: response?.ok ? 'success' : 'failure',
        message: response?.message || 'Connection test failed.'
      });
    } catch (error) {
      setConnectionTest({
        status: 'failure',
        message: error?.message || 'Connection test failed.'
      });
    } finally {
      connectionTestInFlight.current = false;
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="eyebrow">Settings</div>
        <h2>AI Provider Settings</h2>
        <div className="field-grid">
          <div className="field">
            <label htmlFor="ai-provider">Provider</label>
            <select
              id="ai-provider"
              disabled={loading}
              onChange={(event) => {
                setProvider(event.target.value);
                setApiKey('');
                setMessage('');
                setConnectionTest({ status: 'idle', message: '' });
              }}
              value={provider}
            >
              {providers.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="ai-model">Model Name</label>
            <input
              id="ai-model"
              disabled={loading}
              onChange={(event) => setModels({ ...models, [provider]: event.target.value })}
              placeholder={provider === 'openai' ? 'Example: gpt-4.1' : 'Example: claude-sonnet-4-6'}
              value={models[provider] || ''}
            />
          </div>
          <div className="field">
            <label htmlFor="ai-api-key">{selectedProviderLabel} API Key</label>
            <input
              autoComplete="off"
              id="ai-api-key"
              disabled={loading}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={apiKeySaved[provider] ? 'Saved locally. Enter a new key to replace.' : 'Enter API key'}
              type="password"
              value={apiKey}
            />
          </div>
        </div>
        <p className="small-note">
          {loading
            ? 'Loading saved API key status.'
            : apiKeySaved[provider]
              ? `${selectedProviderLabel} API key saved locally.`
              : `${selectedProviderLabel} API key not saved yet.`}
        </p>
        {message ? <p className="editor-message">{message}</p> : null}
        {connectionTest.message ? <p className={`editor-message connection-test-message ${connectionTest.status}`}>{connectionTest.message}</p> : null}
        <div className="modal-actions">
          <button className="secondary-button" onClick={closeSettings} type="button">Close</button>
          <button
            className="secondary-button"
            disabled={loading || connectionTest.status === 'loading'}
            onClick={connectionTest.status === 'loading' ? undefined : testConnection}
            type="button"
          >
            {connectionTest.status === 'loading' ? 'Testing...' : 'Test Connection'}
          </button>
          <button className="primary-button" disabled={loading} onClick={saveSettings} type="button">Save Settings</button>
        </div>
      </section>
    </div>
  );
}

async function loadApiKeyStatus() {
  const [openai, anthropic] = await Promise.all([
    window.revival?.config.hasApiKey('openai'),
    window.revival?.config.hasApiKey('anthropic')
  ]);

  return {
    anthropic: Boolean(anthropic),
    openai: Boolean(openai)
  };
}
