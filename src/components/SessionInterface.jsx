import { Copy, Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  assembleContextPackPrompt,
  assembleContextPackSessionContext,
  loadCustomPromptTemplates,
  sessionPromptTemplates
} from '../contextPackSessionContext.js';
import { useRevivalStore } from '../store.js';

const providers = [
  ['openai', 'OpenAI'],
  ['anthropic', 'Claude / Anthropic']
];

const defaultModels = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4.1'
};

export default function SessionInterface() {
  const [contextPackId, setContextPackId] = useState('');
  const [provider, setProvider] = useState('openai');
  const [models, setModels] = useState(defaultModels);
  const [templateId, setTemplateId] = useState(sessionPromptTemplates[0].id);
  const [templateInstructionsDraft, setTemplateInstructionsDraft] = useState(sessionPromptTemplates[0].instructions);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [hydratedSessionId, setHydratedSessionId] = useState(null);
  const [sessionToHydrateId, setSessionToHydrateId] = useState(null);
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [customPromptTemplates] = useState(() => loadCustomPromptTemplates());
  const contextPacks = useRevivalStore((state) => state.contextPacks);
  const characters = useRevivalStore((state) => state.characters);
  const episodes = useRevivalStore((state) => state.episodes);
  const decisions = useRevivalStore((state) => state.decisions);
  const questions = useRevivalStore((state) => state.questions);
  const livingDocs = useRevivalStore((state) => state.livingDocs);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const entityLinksByKey = useRevivalStore((state) => state.entityLinksByKey);
  const aiSessions = useRevivalStore((state) => state.aiSessions);
  const activeAiSession = useRevivalStore((state) => state.activeAiSession);
  const loadContextPacks = useRevivalStore((state) => state.loadContextPacks);
  const loadAiSessions = useRevivalStore((state) => state.loadAiSessions);
  const createAiSession = useRevivalStore((state) => state.createAiSession);
  const selectAiSession = useRevivalStore((state) => state.selectAiSession);
  const showToast = useRevivalStore((state) => state.showToast);
  const templates = useMemo(() => [...sessionPromptTemplates, ...customPromptTemplates], [customPromptTemplates]);
  const activePromptTemplates = useMemo(() => templates.map((template) => (
    template.id === templateId
      ? { ...template, instructions: templateInstructionsDraft }
      : template
  )), [templateId, templateInstructionsDraft, templates]);
  const selectedPack = useMemo(
    () => contextPacks.find((pack) => String(pack.id) === String(contextPackId)) || contextPacks[0] || null,
    [contextPackId, contextPacks]
  );
  const selectedModel = models[provider] ?? defaultModels[provider] ?? '';
  const sessionContext = useMemo(() => {
    if (!selectedPack) return '';

    return assembleContextPackSessionContext({
      title: selectedPack.title,
      purpose: selectedPack.purpose,
      links: selectedPack.links || [],
      entityTagsByKey,
      entityLinksByKey,
      recordsByType: {
        bible_section: nodeTree,
        character: characters,
        decision: decisions,
        episode: episodes,
        living_document: Object.values(livingDocs).flat(),
        question: questions
      }
    });
  }, [characters, decisions, entityLinksByKey, entityTagsByKey, episodes, livingDocs, nodeTree, questions, selectedPack]);
  const finalPrompt = useMemo(() => (
    sessionContext
      ? assembleContextPackPrompt({ additionalInstructions, sessionContext, templateId, templates: activePromptTemplates })
      : ''
  ), [activePromptTemplates, additionalInstructions, sessionContext, templateId]);

  useEffect(() => {
    loadContextPacks();
    loadAiSessions();
  }, [loadAiSessions, loadContextPacks]);

  useEffect(() => {
    let cancelled = false;

    async function loadProviderPreferences() {
      const savedSettings = await window.revival?.config.getPreferences();
      if (cancelled || !savedSettings) return;

      const savedProvider = normalizeProvider(savedSettings.aiProvider);
      setProvider(savedProvider);
      setModels({
        anthropic: savedSettings.aiModels?.anthropic || defaultModels.anthropic,
        openai: savedSettings.aiModels?.openai || defaultModels.openai
      });
    }

    loadProviderPreferences();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.querySelector('.content')?.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (!contextPackId && contextPacks[0]?.id) {
      setContextPackId(String(contextPacks[0].id));
    }
  }, [contextPackId, contextPacks]);

  useEffect(() => {
    if (
      !activeAiSession?.id
      || !sessionToHydrateId
      || submitting
      || String(activeAiSession.id) !== String(sessionToHydrateId)
      || String(activeAiSession.id) === String(hydratedSessionId)
    ) return;

    const savedContextPack = contextPacks.find((pack) => String(pack.id) === String(activeAiSession.context_id));
    const savedTemplate = templates.find((template) => template.id === activeAiSession.template_id);

    if (savedContextPack) {
      setContextPackId(String(savedContextPack.id));
    }

    if (savedTemplate) {
      setTemplateId(savedTemplate.id);
    }

    setTemplateInstructionsDraft(extractTemplateInstructions(activeAiSession.prompt) || savedTemplate?.instructions || '');
    setAdditionalInstructions(activeAiSession.user_instructions || '');
    setHydratedSessionId(activeAiSession.id);
    setSessionToHydrateId(null);
  }, [activeAiSession, contextPacks, hydratedSessionId, sessionToHydrateId, submitting, templates]);

  const openSavedSession = (sessionId) => {
    setSessionToHydrateId(sessionId);
    selectAiSession(sessionId);
  };

  const changeTemplate = (nextTemplateId) => {
    setTemplateId(nextTemplateId);
    setTemplateInstructionsDraft(getTemplateInstructions(nextTemplateId, templates));
  };

  const saveProviderPreferences = async (nextProvider = provider, nextModels = models) => {
    await window.revival?.config.setPreferences({
      aiProvider: nextProvider,
      aiModels: {
        anthropic: nextModels.anthropic ?? defaultModels.anthropic,
        openai: nextModels.openai ?? defaultModels.openai
      }
    });
  };

  const changeProvider = async (nextProvider) => {
    const normalizedProvider = normalizeProvider(nextProvider);
    const nextModels = {
      ...models,
      [normalizedProvider]: models[normalizedProvider] ?? defaultModels[normalizedProvider]
    };

    setProvider(normalizedProvider);
    setModels(nextModels);
    await saveProviderPreferences(normalizedProvider, nextModels);
  };

  const changeModel = (nextModel) => {
    const nextModels = {
      ...models,
      [provider]: nextModel
    };

    setModels(nextModels);
  };

  const startSession = async () => {
    if (!selectedPack || !finalPrompt || submitting) return;

    setSubmitting(true);
    setStatus('Sending prompt to selected provider...');

    try {
      await saveProviderPreferences(provider, {
        ...models,
        [provider]: selectedModel
      });
      const response = await createAiSession({
        contextId: selectedPack.id,
        contextType: 'context_pack',
        prompt: finalPrompt,
        templateId,
        userInstructions: additionalInstructions
      });

    if (response?.ok) {
        setStatus('Session generated and saved');
        showToast('Session generated and saved');
      } else {
        setStatus(response?.message || 'AI session failed.');
      }
    } catch {
      setStatus('AI session failed before a provider response was saved.');
    } finally {
      setSubmitting(false);
    }
  };

  const clearDraft = () => {
    setTemplateInstructionsDraft(getTemplateInstructions(templateId, templates));
    setAdditionalInstructions('');
    setStatus('');
  };

  const copyResponse = async () => {
    if (!activeAiSession?.response) return;

    try {
      await copyText(activeAiSession.response);
      setCopyMessage('Response copied.');
    } catch {
      setCopyMessage('Response copy failed.');
    }
  };

  return (
    <section className="session-workspace">
      <div className="session-workspace-header">
        <div>
          <div className="eyebrow">AI Session</div>
          <h1>Single Response Workflow</h1>
        </div>
      </div>

      <div className="session-workspace-grid">
        <article className="panel-card session-composer">
          <div className="session-context-header">
            <h2>Controls</h2>
            <span>{formatProvider(provider)} / {selectedModel || 'model unset'}</span>
          </div>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="ai-session-provider">AI Provider</label>
              <select disabled={submitting} id="ai-session-provider" onChange={(event) => changeProvider(event.target.value)} value={provider}>
                {providers.map(([id, label]) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ai-session-model">Model</label>
              <input
                disabled={submitting}
                id="ai-session-model"
                onBlur={() => saveProviderPreferences(provider, models)}
                onChange={(event) => changeModel(event.target.value)}
                placeholder={provider === 'openai' ? 'gpt-4.1' : 'claude-sonnet-4-6'}
                type="text"
                value={selectedModel}
              />
            </div>
            <div className="field">
              <label htmlFor="ai-session-context">Session Context</label>
              <select disabled={submitting} id="ai-session-context" onChange={(event) => setContextPackId(event.target.value)} value={contextPackId}>
                {contextPacks.map((pack) => (
                  <option key={pack.id} value={pack.id}>{pack.title}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="ai-session-template">Template</label>
              <select disabled={submitting} id="ai-session-template" onChange={(event) => changeTemplate(event.target.value)} value={templateId}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.builtIn ? template.label : `${template.label} (Custom)`}
                  </option>
                ))}
              </select>
            </div>
            <div className="field session-template-instructions-field">
              <label htmlFor="ai-session-template-instructions">Template Instructions</label>
              <textarea
                disabled={submitting}
                id="ai-session-template-instructions"
                onChange={(event) => setTemplateInstructionsDraft(event.target.value)}
                placeholder="Refine how this template should guide the response."
                rows={7}
                spellCheck="true"
                value={templateInstructionsDraft}
              />
            </div>
            <div className="field session-template-instructions-field">
              <label htmlFor="ai-session-additional-instructions">Additional Instructions</label>
              <textarea
                disabled={submitting}
                id="ai-session-additional-instructions"
                onChange={(event) => setAdditionalInstructions(event.target.value)}
                placeholder="Add one focused instruction for this run."
                rows={6}
                value={additionalInstructions}
              />
            </div>
          </div>
          <div className="session-workspace-actions">
            <button className="secondary-button" onClick={clearDraft} type="button">
              <RotateCcw size={15} />
              <span>Reset Draft</span>
            </button>
            <button className="primary-button" disabled={!selectedPack || !finalPrompt || submitting} onClick={startSession} type="button">
              <Play size={15} />
              <span>{submitting ? 'Generating...' : 'Generate'}</span>
            </button>
          </div>
          {status ? <p className={`session-status ${status.includes('failed') ? 'failure' : 'success'}`}>{status}</p> : null}
        </article>

        <article className="panel-card session-response-panel">
          <div className="session-context-header">
            <h2>{activeAiSession ? 'Selected Session' : 'Latest Session'}</h2>
            {activeAiSession ? <span>{formatProvider(activeAiSession.provider)} / {activeAiSession.model}</span> : null}
          </div>
          {activeAiSession ? (
            <>
              <div className="session-response-actions">
                {copyMessage ? <span className="session-context-copy-message">{copyMessage}</span> : null}
                <button className="secondary-button context-copy-button" onClick={copyResponse} type="button">
                  <Copy size={14} />
                  <span>Copy Response</span>
                </button>
                <button className="secondary-button" disabled={!selectedPack || !finalPrompt || submitting} onClick={startSession} type="button">
                  <RotateCcw size={14} />
                  <span>Re-run</span>
                </button>
              </div>
              <div className="session-response-grid">
                <section>
                  <div className="session-context-header">
                    <h3>Prompt Preview</h3>
                    <span>{(activeAiSession.prompt || '').length.toLocaleString()} chars</span>
                  </div>
                  <pre>{activeAiSession.prompt}</pre>
                </section>
                <section>
                  <h3>Response</h3>
                  <pre>{activeAiSession.response}</pre>
                </section>
              </div>
            </>
          ) : (
            <section className="prompt-preview" aria-label="Final prompt preview">
              <div className="session-context-header">
                <h3>Prompt Preview</h3>
                <span>{finalPrompt.length.toLocaleString()} chars</span>
              </div>
              <pre>{finalPrompt || 'Create a context pack before starting an AI session.'}</pre>
            </section>
          )}
        </article>

        <aside className="panel-card session-history-panel">
          <div className="session-context-header">
            <h2>History</h2>
            <span>{aiSessions.length}</span>
          </div>
          <div className="session-history-list">
            {aiSessions.length ? aiSessions.map((session) => (
              <button
                className={`session-history-item ${activeAiSession?.id === session.id ? 'selected' : ''}`}
                key={session.id}
                onClick={() => openSavedSession(session.id)}
                type="button"
              >
                <strong>{formatProvider(session.provider)}</strong>
                <span>{session.model || 'model unset'}</span>
                <span>{formatDate(session.created_at)}</span>
              </button>
            )) : (
              <div className="placeholder-block">No AI sessions saved yet.</div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function formatProvider(provider = '') {
  if (provider === 'anthropic') return 'Claude / Anthropic';
  if (provider === 'openai') return 'OpenAI';
  return provider || 'Provider';
}

function normalizeProvider(provider = 'openai') {
  return provider === 'anthropic' ? 'anthropic' : 'openai';
}

function formatDate(value) {
  if (!value) return 'No timestamp';
  return new Date(value).toLocaleString();
}

function getTemplateInstructions(templateId, templates) {
  return templates.find((template) => template.id === templateId)?.instructions || '';
}

function extractTemplateInstructions(prompt = '') {
  const text = String(prompt || '');
  const templateStart = text.indexOf('# Prompt Template');
  if (templateStart === -1) return '';

  const afterTemplateTitle = text.slice(templateStart + '# Prompt Template'.length).trimStart();
  const withoutTemplateName = afterTemplateTitle.replace(/^## .*(\r?\n|$)/, '');
  const userInstructionStart = withoutTemplateName.search(/(?:\n|,)# User Instructions/);
  const contextStart = withoutTemplateName.search(/(?:\n|,)# Generated Session Context/);
  const endCandidates = [userInstructionStart, contextStart].filter((index) => index >= 0);
  const endIndex = endCandidates.length ? Math.min(...endCandidates) : withoutTemplateName.length;

  return withoutTemplateName.slice(0, endIndex).trim();
}

async function copyText(text) {
  if (window.revival?.clipboard?.writeText) {
    const response = await window.revival.clipboard.writeText(text);
    if (response?.ok) return;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back when Electron focus prevents direct clipboard access.
    }
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    const copied = document.execCommand('copy');
    if (!copied) throw new Error('Clipboard command was not accepted.');
  } finally {
    document.body.removeChild(textArea);
  }
}
