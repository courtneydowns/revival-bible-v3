import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';

const providers = [
  ['openai', 'OpenAI'],
  ['anthropic', 'Claude / Anthropic']
];

export default function SettingsModal() {
  const closeSettings = useRevivalStore((state) => state.closeSettings);
  const recoverySnapshots = useRevivalStore((state) => state.recoverySnapshots);
  const loadRecoverySnapshots = useRevivalStore((state) => state.loadRecoverySnapshots);
  const createRecoverySnapshot = useRevivalStore((state) => state.createRecoverySnapshot);
  const restoreRecoverySnapshot = useRevivalStore((state) => state.restoreRecoverySnapshot);
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [models, setModels] = useState({ anthropic: '', openai: '' });
  const [apiKeySaved, setApiKeySaved] = useState({});
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [recoveryMessage, setRecoveryMessage] = useState('');
  const [recoveryBusy, setRecoveryBusy] = useState(false);
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
      await loadRecoverySnapshots();
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

  const saveSnapshot = async () => {
    if (recoveryBusy) return;

    setRecoveryBusy(true);
    setRecoveryMessage('');
    const response = await createRecoverySnapshot({
      label: snapshotLabel.trim() || 'Manual safety snapshot'
    });
    setRecoveryMessage(response?.ok ? 'Snapshot created locally.' : response?.message || 'Snapshot failed.');
    if (response?.ok) setSnapshotLabel('');
    setRecoveryBusy(false);
  };

  const restoreSnapshot = async (snapshot) => {
    if (!snapshot?.id || recoveryBusy) return;

    const confirmed = window.confirm(`Restore "${snapshot.label}" from ${snapshot.createdAtCentral}? Current state will change. A pre-restore safety backup will be created first.`);
    if (!confirmed) return;

    setRecoveryBusy(true);
    setRecoveryMessage('');
    const response = await restoreRecoverySnapshot(snapshot.id);
    setRecoveryMessage(response?.ok
      ? 'Snapshot restored. A pre-restore safety backup was created first.'
      : response?.message || 'Restore failed.');
    setRecoveryBusy(false);
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
        <section className="settings-recovery-panel" aria-labelledby="settings-recovery-title">
          <div>
            <div className="eyebrow">Maintenance</div>
            <h3 id="settings-recovery-title">Recovery</h3>
            <p className="small-note">
              Local snapshots capture the SQLite editorial state before risky work. Restores require confirmation and create a pre-restore backup first.
            </p>
          </div>
          <div className="settings-recovery-create">
            <input
              disabled={recoveryBusy}
              onChange={(event) => setSnapshotLabel(event.target.value)}
              placeholder="Snapshot label or reason"
              value={snapshotLabel}
            />
            <button className="secondary-button" disabled={recoveryBusy} onClick={saveSnapshot} type="button">
              Create Snapshot
            </button>
          </div>
          {recoveryMessage ? <p className="editor-message">{recoveryMessage}</p> : null}
          <div className="settings-snapshot-list">
            {recoverySnapshots.length ? recoverySnapshots.map((snapshot) => (
              <article className="settings-snapshot-row" key={snapshot.id}>
                <div>
                  <strong>{snapshot.label || 'Snapshot'}</strong>
                  <span>{snapshot.createdAtCentral || snapshot.createdAt}</span>
                  <small>
                    {formatSnapshotCounts(snapshot.recordCounts)}
                  </small>
                </div>
                <button className="secondary-button" disabled={recoveryBusy} onClick={() => restoreSnapshot(snapshot)} type="button">
                  Restore
                </button>
              </article>
            )) : (
              <p className="small-note">No snapshots yet.</p>
            )}
          </div>
        </section>
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

function formatSnapshotCounts(recordCounts = {}) {
  const sourceCount = Number(recordCounts.source_memory_records || 0);
  const extractionCount = Number(recordCounts.editorial_extractions || 0);
  const canonCount = [
    recordCounts.characters,
    recordCounts.episodes,
    recordCounts.decisions,
    recordCounts.questions
  ].reduce((total, count) => total + Number(count || 0), 0);

  return `${canonCount} canon/editorial anchors · ${sourceCount} sources · ${extractionCount} extractions`;
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
