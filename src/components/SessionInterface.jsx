import { Check, Copy, Expand, List, Pencil, PanelRightClose, PanelRightOpen, Play, Plus, RotateCcw, Send, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  assembleContextPackPrompt,
  assembleContextPackSessionContext,
  loadCustomPromptTemplates,
  sessionPromptTemplates
} from '../contextPackSessionContext.js';
import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';

const providers = [
  ['openai', 'OpenAI'],
  ['anthropic', 'Claude / Anthropic']
];

const defaultModels = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4.1'
};

const getSavedHistoryMode = () => {
  if (typeof localStorage === 'undefined') return 'expanded';
  const mode = localStorage.getItem('revival-ai-history-mode');
  return ['expanded', 'compact', 'collapsed'].includes(mode) ? mode : 'expanded';
};

const customSessionTitleStorageKey = 'revival-ai-session-titles';
const sessionResponseScrollStorageKey = 'revival-ai-session-response-scroll';
const sessionComposerDraftStorageKey = 'revival-ai-session-composer-draft';

export default function SessionInterface() {
  const [recoveredComposerDraft] = useState(loadSessionComposerDraft);
  const [contextPackId, setContextPackId] = useState(recoveredComposerDraft.contextPackId || '');
  const [provider, setProvider] = useState(recoveredComposerDraft.provider || 'openai');
  const [models, setModels] = useState({ ...defaultModels, ...recoveredComposerDraft.models });
  const [templateId, setTemplateId] = useState(recoveredComposerDraft.templateId || sessionPromptTemplates[0].id);
  const [templateInstructionsDraft, setTemplateInstructionsDraft] = useState(recoveredComposerDraft.templateInstructionsDraft || sessionPromptTemplates[0].instructions);
  const [additionalInstructions, setAdditionalInstructions] = useState(recoveredComposerDraft.additionalInstructions || '');
  const [copyMessage, setCopyMessage] = useState('');
  const [composerSaveStatus, setComposerSaveStatus] = useState(recoveredComposerDraft.updatedAt ? 'Recovered draft' : '');
  const [customSessionTitles, setCustomSessionTitles] = useState(loadCustomSessionTitles);
  const [editingTitle, setEditingTitle] = useState(false);
  const [hydratedSessionId, setHydratedSessionId] = useState(null);
  const [sessionToHydrateId, setSessionToHydrateId] = useState(null);
  const [status, setStatus] = useState('');
  const [titleDraft, setTitleDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const [extractionDraft, setExtractionDraft] = useState(null);
  const [extractionSelection, setExtractionSelection] = useState(null);
  const [savingExtraction, setSavingExtraction] = useState(false);
  const [historyMode, setHistoryMode] = useState(getSavedHistoryMode);
  const [reader, setReader] = useState(null);
  const [customPromptTemplates] = useState(() => loadCustomPromptTemplates());
  const responseScrollRef = useRef(null);
  const readerTextRef = useRef(null);
  const composerSaveTimerRef = useRef(null);
  const contextPacks = useRevivalStore((state) => state.contextPacks);
  const databasePath = useRevivalStore((state) => state.databaseInfo.path);
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
  const sourceSessionJump = useRevivalStore((state) => state.sourceSessionJump);
  const loadContextPacks = useRevivalStore((state) => state.loadContextPacks);
  const loadAiSessions = useRevivalStore((state) => state.loadAiSessions);
  const createAiSession = useRevivalStore((state) => state.createAiSession);
  const createCandidate = useRevivalStore((state) => state.createCandidate);
  const deleteAiSession = useRevivalStore((state) => state.deleteAiSession);
  const selectAiSession = useRevivalStore((state) => state.selectAiSession);
  const clearSourceSessionJump = useRevivalStore((state) => state.clearSourceSessionJump);
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
  const activeSessionTitle = activeAiSession ? getSessionTitle(activeAiSession, customSessionTitles) : '';
  const sessionStatusTone = status.toLowerCase().includes('failed') ? 'failure' : 'success';

  useEffect(() => {
    loadContextPacks();
    loadAiSessions();
  }, [loadAiSessions, loadContextPacks]);

  useEffect(() => {
    let cancelled = false;

    async function loadProviderPreferences() {
      const savedSettings = await window.revival?.config.getPreferences();
      if (cancelled || !savedSettings) return;
      if (recoveredComposerDraft.updatedAt) return;

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
  }, [recoveredComposerDraft.updatedAt]);

  useEffect(() => {
    document.querySelector('.content')?.scrollTo({ top: 0, left: 0 });
  }, []);

  useEffect(() => {
    if (!copyMessage) return undefined;

    const timeoutId = window.setTimeout(() => setCopyMessage(''), 2200);
    return () => window.clearTimeout(timeoutId);
  }, [copyMessage]);

  useEffect(() => {
    if (contextPacks.length && (!contextPackId || !contextPacks.some((pack) => String(pack.id) === String(contextPackId)))) {
      setContextPackId(String(contextPacks[0].id));
    }
  }, [contextPackId, contextPacks]);

  useEffect(() => {
    if (!databasePath) return;

    const workspaceDraft = loadSessionComposerDraft(databasePath);
    if (!workspaceDraft.updatedAt || hasSessionComposerDraftChanges({
      additionalInstructions,
      templateId,
      templateInstructionsDraft
    }, templates)) return;

    setContextPackId(workspaceDraft.contextPackId || contextPackId);
    setProvider(workspaceDraft.provider || provider);
    setModels({ ...defaultModels, ...workspaceDraft.models });
    setTemplateId(workspaceDraft.templateId || templateId);
    setTemplateInstructionsDraft(workspaceDraft.templateInstructionsDraft || getTemplateInstructions(workspaceDraft.templateId || templateId, templates));
    setAdditionalInstructions(workspaceDraft.additionalInstructions || '');
    setComposerSaveStatus('Recovered draft');
  }, [additionalInstructions, contextPackId, databasePath, provider, templateId, templateInstructionsDraft, templates]);

  useEffect(() => {
    if (composerSaveTimerRef.current) window.clearTimeout(composerSaveTimerRef.current);

    composerSaveTimerRef.current = window.setTimeout(() => {
      const composerDraft = {
        additionalInstructions,
        contextPackId,
        models,
        provider,
        templateId,
        templateInstructionsDraft
      };

      if (hasSessionComposerDraftChanges(composerDraft, templates)) {
        persistSessionComposerDraft(databasePath, composerDraft);
        setComposerSaveStatus('Draft saved');
      } else {
        removeSessionComposerDraft(databasePath);
        setComposerSaveStatus('');
      }
    }, 500);

    return () => {
      if (composerSaveTimerRef.current) window.clearTimeout(composerSaveTimerRef.current);
    };
  }, [additionalInstructions, contextPackId, databasePath, models, provider, templateId, templateInstructionsDraft, templates]);

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

  useEffect(() => {
    const responseNode = responseScrollRef.current;
    if (!responseNode || !activeAiSession?.id) return undefined;

    const savedScroll = getSavedResponseScroll(activeAiSession.id);
    const responseLength = String(activeAiSession.response || '').length;
    const updatedAt = activeAiSession.updated_at || activeAiSession.created_at || '';
    const nextTop = savedScroll
      && savedScroll.responseLength === responseLength
      && savedScroll.updatedAt === updatedAt
      ? savedScroll.top
      : 0;

    const frameId = window.requestAnimationFrame(() => {
      const maxTop = Math.max(0, responseNode.scrollHeight - responseNode.clientHeight);
      responseNode.scrollTop = Math.min(nextTop, maxTop);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeAiSession?.created_at, activeAiSession?.id, activeAiSession?.response, activeAiSession?.updated_at]);

  useEffect(() => {
    if (!sourceSessionJump || !activeAiSession?.id || String(sourceSessionJump.sessionId) !== String(activeAiSession.id)) return;

    const responseText = String(activeAiSession.response || '');
    const sourceText = String(sourceSessionJump.text || '').trim();
    setReader({
      title: 'Response',
      text: responseText,
      tone: 'response',
      highlightText: sourceText,
      sourceJumpRequest: sourceSessionJump.requestedAt
    });

    const frameId = window.requestAnimationFrame(() => {
      scrollTextContainerNearMatch(responseScrollRef.current, responseText, sourceText);
      clearSourceSessionJump();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeAiSession?.id, activeAiSession?.response, clearSourceSessionJump, sourceSessionJump]);

  useEffect(() => {
    if (!reader?.sourceJumpRequest) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      scrollTextContainerNearMatch(readerTextRef.current, reader.text, reader.highlightText);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [reader?.highlightText, reader?.sourceJumpRequest, reader?.text]);

  const openSavedSession = (sessionId) => {
    setCopyMessage('');
    setEditingTitle(false);
    setSessionToHydrateId(sessionId);
    selectAiSession(sessionId);
  };

  const startNewSessionDraft = () => {
    setCopyMessage('');
    setEditingTitle(false);
    setHydratedSessionId(null);
    setSessionToHydrateId(null);
    setAdditionalInstructions('');
    setStatus('New session draft ready.');
    selectAiSession(null);
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

  const changeHistoryMode = (nextMode) => {
    const normalizedMode = ['expanded', 'compact', 'collapsed'].includes(nextMode) ? nextMode : 'expanded';
    setHistoryMode(normalizedMode);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('revival-ai-history-mode', normalizedMode);
    }
  };

  const startSession = async () => {
    if (!selectedPack || !finalPrompt || submitting) return;

    setSubmitting(true);
    setCopyMessage('');
    setEditingTitle(false);
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
        removeSessionComposerDraft(databasePath);
        setComposerSaveStatus('');
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
    if (hasSessionComposerDraftChanges({
      additionalInstructions,
      templateId,
      templateInstructionsDraft
    }, templates)) {
      const confirmed = window.confirm('Reset this AI session draft? The saved recovery draft will be cleared.');
      if (!confirmed) return;
    }

    setTemplateInstructionsDraft(getTemplateInstructions(templateId, templates));
    setAdditionalInstructions('');
    removeSessionComposerDraft(databasePath);
    setComposerSaveStatus('');
    setStatus('');
  };

  const startTitleEdit = () => {
    if (!activeAiSession) return;
    setTitleDraft(activeSessionTitle);
    setEditingTitle(true);
  };

  const cancelTitleEdit = () => {
    setTitleDraft('');
    setEditingTitle(false);
  };

  const saveTitleEdit = () => {
    if (!activeAiSession?.id) return;

    const nextTitles = {
      ...customSessionTitles,
      [activeAiSession.id]: titleDraft.trim()
    };

    if (!nextTitles[activeAiSession.id]) {
      delete nextTitles[activeAiSession.id];
    }

    persistCustomSessionTitles(nextTitles);
    setCustomSessionTitles(nextTitles);
    setEditingTitle(false);
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

  const closeReader = () => {
    setReader(null);
    setExtractionSelection(null);
  };

  const captureResponseSelection = (responseNode) => {
    if (!activeAiSession?.id || extractionDraft) return;

    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    if (!selectedText || !responseNode || !selection?.rangeCount || !responseNode.contains(selection.anchorNode) || !responseNode.contains(selection.focusNode)) {
      setExtractionSelection(null);
      return;
    }

    const rect = selection.getRangeAt(0).getBoundingClientRect();
    setExtractionSelection({
      text: selectedText,
      left: Math.min(rect.left + rect.width / 2, window.innerWidth - 130),
      top: Math.max(rect.top - 44, 12)
    });
  };

  const openExtractionDraft = () => {
    if (!activeAiSession || !extractionSelection?.text) return;

    const selectedTemplate = templates.find((template) => template.id === activeAiSession.template_id);
    const createdAt = new Date().toISOString();
    setExtractionDraft({
      title: candidateTitleFromSelection(extractionSelection.text),
      content: extractionSelection.text,
      type: 'Narrative Note',
      provenanceMetadata: {
        source: 'AI Session',
        source_id: activeAiSession.id,
        source_title: activeSessionTitle,
        provider: activeAiSession.provider || '',
        model: activeAiSession.model || '',
        template_id: activeAiSession.template_id || '',
        template: selectedTemplate?.label || activeAiSession.template_id || '',
        workflow: 'Manual extraction',
        created_at: createdAt
      }
    });
    setExtractionSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const saveExtractionDraft = async (event) => {
    event.preventDefault();
    if (!extractionDraft?.title?.trim() || savingExtraction) return;

    setSavingExtraction(true);
    const response = await createCandidate({
      title: extractionDraft.title,
      content: extractionDraft.content,
      type: extractionDraft.type,
      provenanceMetadata: extractionDraft.provenanceMetadata
    });
    setSavingExtraction(false);

    if (response?.ok) {
      setExtractionDraft(null);
      setCopyMessage('Sent to Candidates.');
    } else {
      setCopyMessage(response?.message || 'Candidate save failed.');
    }
  };

  const extractionPopover = extractionSelection ? (
    <button
      className="session-selection-popover"
      onMouseDown={(event) => event.preventDefault()}
      onClick={openExtractionDraft}
      style={{ left: extractionSelection.left, top: extractionSelection.top }}
      type="button"
    >
      <Send size={13} />
      <span>Send to Candidates</span>
    </button>
  ) : null;

  const extractionSheet = activeAiSession && extractionDraft ? (
    <form className="session-extraction-sheet" onSubmit={saveExtractionDraft}>
      <div className="session-context-header">
        <h3>Send to Candidates</h3>
        <button aria-label="Close extraction draft" className="icon-button" onClick={() => setExtractionDraft(null)} type="button">
          <X size={14} />
        </button>
      </div>
      <input
        aria-label="Candidate title"
        onChange={(event) => setExtractionDraft((draft) => ({ ...draft, title: event.target.value }))}
        placeholder="Candidate title"
        value={extractionDraft.title}
      />
      <select
        aria-label="Candidate type"
        onChange={(event) => setExtractionDraft((draft) => ({ ...draft, type: event.target.value }))}
        value={extractionDraft.type}
      >
        <option>Narrative Note</option>
        <option>Continuity Question</option>
        <option>Character Detail</option>
        <option>Timeline Detail</option>
      </select>
      <textarea
        aria-label="Candidate content"
        onChange={(event) => setExtractionDraft((draft) => ({ ...draft, content: event.target.value }))}
        value={extractionDraft.content}
      />
      <div className="session-extraction-footer">
        <span>{formatProvider(activeAiSession.provider)} / {activeAiSession.model || 'model unset'} / {formatDate(extractionDraft.provenanceMetadata.created_at)}</span>
        <button className="primary-button" disabled={savingExtraction || !extractionDraft.title.trim()} type="submit">
          <Send size={14} />
          <span>{savingExtraction ? 'Saving...' : 'Save Candidate'}</span>
        </button>
      </div>
    </form>
  ) : null;

  const saveResponseScroll = (event) => {
    if (!activeAiSession?.id) return;

    persistResponseScroll(activeAiSession.id, {
      responseLength: String(activeAiSession.response || '').length,
      top: event.currentTarget.scrollTop,
      updatedAt: activeAiSession.updated_at || activeAiSession.created_at || ''
    });
  };

  const confirmDeleteSession = async () => {
    if (!activeAiSession?.id || submitting || deletingSessionId) return;

    const sessionId = activeAiSession.id;
    const sessionTitle = activeSessionTitle;
    const confirmed = window.confirm(`Delete "${sessionTitle}"? This only removes the selected saved AI session.`);
    if (!confirmed) return;

    try {
      setDeletingSessionId(sessionId);
      const response = await deleteAiSession(sessionId);

      if (response?.ok) {
        const nextTitles = { ...customSessionTitles };
        delete nextTitles[sessionId];
        persistCustomSessionTitles(nextTitles);
        removeResponseScroll(sessionId);
        setCustomSessionTitles(nextTitles);
        setCopyMessage('');
        setEditingTitle(false);
        setHydratedSessionId(null);
        setSessionToHydrateId(null);
        setStatus('Selected session deleted.');
        showToast('Selected session deleted');
      } else {
        setStatus(response?.message || 'AI session delete failed.');
      }
    } finally {
      setDeletingSessionId(null);
    }
  };

  return (
    <section className="session-workspace">
      <div className="session-workspace-header">
        <div>
          <div className="eyebrow">AI Session</div>
          <h1>Single Response Workflow</h1>
        </div>
        <div className="session-workspace-actions">
          <button className="secondary-button" disabled={submitting} onClick={startNewSessionDraft} type="button">
            <Plus size={15} />
            <span>New Session</span>
          </button>
        </div>
      </div>

      <div className={`session-workspace-grid history-${historyMode}`}>
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
              <label htmlFor="ai-session-template-instructions">
                <span>Template Instructions</span>
                {composerSaveStatus ? <small className="save-state-text" role="status">{composerSaveStatus}</small> : null}
              </label>
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
          {submitting || status ? (
            <div className={`session-run-state ${submitting ? 'loading' : sessionStatusTone}`} role="status">
              <strong>{submitting ? 'Generating session...' : status}</strong>
              <span>{submitting ? 'Waiting for the selected provider response.' : sessionStatusTone === 'failure' ? 'No session was saved for this attempt.' : 'Session state updated.'}</span>
            </div>
          ) : null}
          {activeAiSession ? (
            <>
              <div className="session-title-row">
                {editingTitle ? (
                  <>
                    <input
                      aria-label="Session title"
                      onChange={(event) => setTitleDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') saveTitleEdit();
                        if (event.key === 'Escape') cancelTitleEdit();
                      }}
                      value={titleDraft}
                    />
                    <button aria-label="Save session title" className="icon-button" onClick={saveTitleEdit} type="button">
                      <Check size={14} />
                    </button>
                    <button aria-label="Cancel session title edit" className="icon-button" onClick={cancelTitleEdit} type="button">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <strong>{activeSessionTitle}</strong>
                    <button aria-label="Rename session" className="icon-button" onClick={startTitleEdit} type="button" title="Rename session">
                      <Pencil size={14} />
                    </button>
                  </>
                )}
              </div>
              <div className="session-response-actions">
                <button className="secondary-button context-copy-button" onClick={copyResponse} type="button">
                  <Copy size={14} />
                  <span>Copy Response</span>
                </button>
                {copyMessage ? <span className={`session-copy-feedback ${copyMessage.includes('failed') ? 'failure' : 'success'}`} role="status">{copyMessage}</span> : null}
                <button className="secondary-button" disabled={!selectedPack || !finalPrompt || submitting} onClick={startSession} type="button">
                  <RotateCcw size={14} />
                  <span>Re-run</span>
                </button>
                <button className="secondary-button danger-button" disabled={submitting || Boolean(deletingSessionId)} onClick={confirmDeleteSession} type="button">
                  <Trash2 size={14} />
                  <span>{deletingSessionId ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
              {!reader ? extractionPopover : null}
              {!reader ? extractionSheet : null}
              <div className="session-response-grid">
                <section>
                  <div className="session-context-header">
                    <h3>Prompt Preview</h3>
                    <div className="session-reader-actions">
                      <span>{(activeAiSession.prompt || '').length.toLocaleString()} chars</span>
                      <button
                        aria-label="Expand prompt preview"
                        className="icon-button"
                        onClick={() => setReader({ title: 'Prompt Preview', text: activeAiSession.prompt || '', tone: 'mono' })}
                        title="Expand prompt preview"
                        type="button"
                      >
                        <Expand size={14} />
                      </button>
                    </div>
                  </div>
                  <pre>{activeAiSession.prompt}</pre>
                </section>
                <section>
                  <div className="session-context-header">
                    <h3>Response</h3>
                    <div className="session-reader-actions">
                      <span>{(activeAiSession.response || '').length.toLocaleString()} chars</span>
                      <button
                        aria-label="Expand response"
                        className="icon-button"
                        onClick={() => setReader({ title: 'Response', text: activeAiSession.response || '', tone: 'response' })}
                        title="Expand response"
                        type="button"
                      >
                        <Expand size={14} />
                      </button>
                    </div>
                  </div>
                  <pre
                    className="session-response-text"
                    onKeyUp={(event) => captureResponseSelection(event.currentTarget)}
                    onMouseUp={(event) => captureResponseSelection(event.currentTarget)}
                    onScroll={saveResponseScroll}
                    ref={responseScrollRef}
                  >{activeAiSession.response}</pre>
                </section>
              </div>
            </>
          ) : (
            <section className="prompt-preview" aria-label="Final prompt preview">
              <div className="session-context-header">
                <h3>No Session Selected</h3>
                <div className="session-reader-actions">
                  <span>{finalPrompt.length.toLocaleString()} chars</span>
                  {finalPrompt ? (
                    <button
                      aria-label="Expand prompt preview"
                      className="icon-button"
                      onClick={() => setReader({ title: 'Prompt Preview', text: finalPrompt, tone: 'mono' })}
                      title="Expand prompt preview"
                      type="button"
                    >
                      <Expand size={14} />
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="session-empty-state">
                <strong>{aiSessions.length ? 'New session draft ready.' : 'No AI sessions saved yet.'}</strong>
                <span>{finalPrompt ? 'Choose context and instructions, then generate when ready.' : 'Create a context pack before starting an AI session.'}</span>
              </div>
              {finalPrompt ? <pre>{finalPrompt}</pre> : null}
            </section>
          )}
        </article>

        <aside className="panel-card session-history-panel">
          <div className="session-context-header">
            <h2>{historyMode === 'collapsed' ? <List size={16} /> : 'History'}</h2>
            <div className="session-history-controls">
              {historyMode !== 'collapsed' ? <span>{aiSessions.length}</span> : null}
              <button
                aria-label="Expand history"
                className={historyMode === 'expanded' ? 'selected' : ''}
                onClick={() => changeHistoryMode('expanded')}
                title="Expand history"
                type="button"
              >
                <PanelRightOpen size={14} />
              </button>
              <button
                aria-label="Compact history"
                className={historyMode === 'compact' ? 'selected' : ''}
                onClick={() => changeHistoryMode('compact')}
                title="Compact history"
                type="button"
              >
                <List size={14} />
              </button>
              <button
                aria-label="Collapse history"
                className={historyMode === 'collapsed' ? 'selected' : ''}
                onClick={() => changeHistoryMode('collapsed')}
                title="Collapse history"
                type="button"
              >
                <PanelRightClose size={14} />
              </button>
            </div>
          </div>
          {historyMode !== 'collapsed' ? <div className="session-history-list">
            {aiSessions.length ? aiSessions.map((session) => {
              const isSelected = String(activeAiSession?.id) === String(session.id);
              const sessionTitle = getSessionTitle(session, customSessionTitles);

              return (
                <button
                  aria-current={isSelected ? 'true' : undefined}
                  className={`session-history-item ${isSelected ? 'selected' : ''}`}
                  key={session.id}
                  onClick={() => openSavedSession(session.id)}
                  title={`${sessionTitle} / ${formatProvider(session.provider)} / ${session.model || 'model unset'} / ${formatDate(session.created_at)}`}
                  type="button"
                >
                  <strong>
                    <span>{sessionTitle}</span>
                    {isSelected ? <span className="session-history-current">Current</span> : null}
                  </strong>
                  {historyMode === 'expanded' ? <span>{session.model || 'model unset'}</span> : null}
                  {historyMode === 'expanded' ? <span>{formatDate(session.created_at)}</span> : null}
                </button>
              );
            }) : (
              <div className="placeholder-block">No AI sessions saved yet.</div>
            )}
          </div> : (
            <div className="session-history-list collapsed-list" aria-label="Collapsed session history">
              {aiSessions.length ? aiSessions.map((session) => {
                const isSelected = String(activeAiSession?.id) === String(session.id);
                const sessionTitle = getSessionTitle(session, customSessionTitles);

                return (
                  <button
                    aria-current={isSelected ? 'true' : undefined}
                    aria-label={`Open ${formatProvider(session.provider)} session from ${formatDate(session.created_at)}`}
                    className={`session-history-item ${isSelected ? 'selected' : ''}`}
                    key={session.id}
                    onClick={() => openSavedSession(session.id)}
                    title={`${sessionTitle} / ${formatProvider(session.provider)} / ${session.model || 'model unset'} / ${formatDate(session.created_at)}`}
                    type="button"
                  >
                    <strong>{sessionTitle.slice(0, 1).toUpperCase()}</strong>
                  </button>
                );
              }) : null}
            </div>
          )}
        </aside>
      </div>
      {reader ? (
        <div className="session-reader-backdrop" role="presentation" onMouseDown={closeReader}>
          <section
            aria-label={reader.title}
            aria-modal="true"
            className="session-reader-modal"
            onMouseDown={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="session-context-header">
              <h2>{reader.title}</h2>
              <button aria-label="Close reader" className="icon-button" onClick={closeReader} title="Close reader" type="button">
                <X size={15} />
              </button>
            </div>
            {reader.tone === 'response' ? extractionPopover : null}
            {reader.tone === 'response' ? extractionSheet : null}
            <pre
              className={reader.tone === 'response' ? 'session-reader-response' : ''}
              onKeyUp={reader.tone === 'response' ? (event) => captureResponseSelection(event.currentTarget) : undefined}
              onMouseUp={reader.tone === 'response' ? (event) => captureResponseSelection(event.currentTarget) : undefined}
              ref={readerTextRef}
            >{renderHighlightedText(reader.text, reader.highlightText)}</pre>
          </section>
        </div>
      ) : null}
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
  return formatCentralTime(value, { fallback: 'No timestamp', dateStyle: 'medium', timeStyle: 'short' });
}

function getTemplateInstructions(templateId, templates) {
  return templates.find((template) => template.id === templateId)?.instructions || '';
}

function loadCustomSessionTitles() {
  if (typeof localStorage === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem(customSessionTitleStorageKey) || '{}');
  } catch {
    return {};
  }
}

function getSessionComposerDrafts() {
  if (typeof localStorage === 'undefined') return {};

  try {
    const drafts = JSON.parse(localStorage.getItem(sessionComposerDraftStorageKey) || '{}');
    return drafts.updatedAt ? { local: drafts } : drafts;
  } catch {
    return {};
  }
}

function loadSessionComposerDraft(databasePath = 'local') {
  return getSessionComposerDrafts()[getSessionComposerDraftKey(databasePath)] || {};
}

function persistSessionComposerDraft(databasePath, draft) {
  if (typeof localStorage === 'undefined') return;

  localStorage.setItem(sessionComposerDraftStorageKey, JSON.stringify({
    ...getSessionComposerDrafts(),
    [getSessionComposerDraftKey(databasePath)]: {
      ...draft,
      updatedAt: new Date().toISOString()
    }
  }));
}

function removeSessionComposerDraft(databasePath = 'local') {
  if (typeof localStorage === 'undefined') return;

  const drafts = getSessionComposerDrafts();
  delete drafts[getSessionComposerDraftKey(databasePath)];
  localStorage.setItem(sessionComposerDraftStorageKey, JSON.stringify(drafts));
}

function getSessionComposerDraftKey(databasePath) {
  return databasePath || 'local';
}

function hasSessionComposerDraftChanges(draft, templates) {
  return String(draft.additionalInstructions || '').trim()
    || String(draft.templateInstructionsDraft || '') !== String(getTemplateInstructions(draft.templateId, templates) || '');
}

function persistCustomSessionTitles(titles) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(customSessionTitleStorageKey, JSON.stringify(titles));
}

function getSavedResponseScroll(sessionId) {
  if (typeof localStorage === 'undefined' || !sessionId) return null;

  try {
    const savedScrolls = JSON.parse(localStorage.getItem(sessionResponseScrollStorageKey) || '{}');
    return savedScrolls[sessionId] || null;
  } catch {
    return null;
  }
}

function persistResponseScroll(sessionId, scrollState) {
  if (typeof localStorage === 'undefined' || !sessionId) return;

  let savedScrolls = {};
  try {
    savedScrolls = JSON.parse(localStorage.getItem(sessionResponseScrollStorageKey) || '{}');
  } catch {
    savedScrolls = {};
  }

  localStorage.setItem(sessionResponseScrollStorageKey, JSON.stringify({
    ...savedScrolls,
    [sessionId]: scrollState
  }));
}

function removeResponseScroll(sessionId) {
  if (typeof localStorage === 'undefined' || !sessionId) return;

  try {
    const savedScrolls = JSON.parse(localStorage.getItem(sessionResponseScrollStorageKey) || '{}');
    delete savedScrolls[sessionId];
    localStorage.setItem(sessionResponseScrollStorageKey, JSON.stringify(savedScrolls));
  } catch {
    localStorage.removeItem(sessionResponseScrollStorageKey);
  }
}

function getSessionTitle(session, customTitles = {}) {
  const customTitle = customTitles[session.id]?.trim();
  if (customTitle) return customTitle;

  const instructionTitle = titleFromUserInstructions(session.user_instructions);
  if (instructionTitle) return instructionTitle;

  const promptTitle = titleFromPrompt(session.prompt);
  if (promptTitle) return promptTitle;

  return `${formatProvider(session.provider)} session`;
}

function titleFromUserInstructions(instructions = '') {
  const clean = cleanTitleLine(instructions);
  return clean ? limitTitle(clean) : '';
}

function titleFromPrompt(prompt = '') {
  const text = String(prompt || '');
  const templateMatch = text.match(/##\s+(.+)/);
  const contextMatch = text.match(/Context Pack:\s*(.+)/i);
  const candidate = cleanTitleLine(contextMatch?.[1] || templateMatch?.[1] || '');
  return candidate ? limitTitle(candidate) : '';
}

function cleanTitleLine(value = '') {
  return String(value || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*#\s]+/, '').trim())
    .find(Boolean) || '';
}

function limitTitle(value = '') {
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 54 ? `${normalized.slice(0, 51)}...` : normalized;
}

function candidateTitleFromSelection(value = '') {
  const clean = cleanTitleLine(value);
  if (!clean) return 'AI session excerpt';
  return limitTitle(clean);
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

function getTextMatchIndex(text = '', sourceText = '') {
  return getTextMatch(text, sourceText).index;
}

function getTextMatch(text = '', sourceText = '') {
  const haystack = String(text || '');
  const needle = String(sourceText || '').trim();
  if (!haystack || !needle) return { index: -1, length: 0 };

  const directIndex = haystack.indexOf(needle);
  if (directIndex >= 0) return { index: directIndex, length: needle.length };

  const excerpt = needle.slice(0, 180).trim();
  const excerptIndex = excerpt ? haystack.indexOf(excerpt) : -1;
  return excerptIndex >= 0 ? { index: excerptIndex, length: excerpt.length } : { index: -1, length: 0 };
}

function scrollTextContainerNearMatch(node, text = '', sourceText = '') {
  if (!node) return;

  const matchIndex = getTextMatchIndex(text, sourceText);
  if (matchIndex < 0) {
    node.scrollTop = 0;
    return;
  }

  const maxTop = Math.max(0, node.scrollHeight - node.clientHeight);
  const ratio = matchIndex / Math.max(1, String(text || '').length);
  node.scrollTop = Math.max(0, Math.min(maxTop, Math.floor(maxTop * ratio) - 32));
}

function renderHighlightedText(text = '', highlightText = '') {
  const value = String(text || '');
  const match = getTextMatch(value, highlightText);
  if (match.index < 0) return value;

  const matchedText = value.slice(match.index, match.index + match.length);
  return (
    <>
      {value.slice(0, match.index)}
      <mark className="session-source-highlight">{matchedText}</mark>
      {value.slice(match.index + matchedText.length)}
    </>
  );
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
