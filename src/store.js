import { create } from 'zustand';

const initialLivingDocs = {
  rewatch_ledger: [],
  dread_map: [],
  obligation_ledger: [],
  caroline_map: []
};

const getSavedNavMode = () => {
  if (typeof localStorage === 'undefined') return 'expanded';
  return localStorage.getItem('revival-nav-mode') === 'compact' ? 'compact' : 'expanded';
};

const activeAiSessionStorageKey = 'revival-active-ai-session-id';
const localCandidateStorageKey = 'revival-local-candidates';

const getSavedActiveAiSessionId = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(activeAiSessionStorageKey) || null;
};

const persistActiveAiSessionId = (sessionId) => {
  if (typeof localStorage === 'undefined') return;
  if (sessionId) {
    localStorage.setItem(activeAiSessionStorageKey, String(sessionId));
  } else {
    localStorage.removeItem(activeAiSessionStorageKey);
  }
};

export const useRevivalStore = create((set, get) => ({
  navMode: getSavedNavMode(),
  activeView: 'dashboard',
  activeNodeId: null,
  activeEpisodeId: null,
  activeEpisodeSeason: 1,
  activeCharacterId: null,
  activeDecisionId: null,
  activeQuestionId: null,
  activeContextPackId: null,
  activeTimelineEventId: null,
  activeCandidateId: null,
  activeLivingDocType: 'rewatch_ledger',
  activeLivingDocEntryId: null,
  expandedNodes: [],
  nodeTree: [],
  selectedNode: null,
  selectedNodeContent: null,
  episodes: [],
  selectedEpisode: null,
  characters: [],
  selectedCharacter: null,
  selectedCharacterRelationships: [],
  characterRelationshipCount: 0,
  decisions: [],
  questions: [],
  contextPacks: [],
  contextPackSessionContexts: {},
  aiSessions: [],
  candidates: [],
  activeAiSessionId: getSavedActiveAiSessionId(),
  activeAiSession: null,
  sourceSessionJump: null,
  timelineEvents: [],
  canonTags: [],
  entityTagsByKey: {},
  entityLinksByKey: {},
  livingDocs: initialLivingDocs,
  searchOpen: false,
  settingsOpen: false,
  aiPanelOpen: true,
  aiPanelTab: 'ask',
  needsApiKey: false,
  hasUnsaved: false,
  streamingState: null,
  toastMessage: '',
  toastId: 0,
  lastToastMessage: '',
  lastToastId: 0,
  navigationHistory: [],
  navigationFocusTick: 0,
  databaseInfo: {
    connected: false,
    path: ''
  },
  saveState: {
    label: 'Autosave ready',
    savedAt: null,
    status: 'idle'
  },

  setActiveView: (activeView) => set((state) => {
    if (state.activeView === activeView) return {};

    return {
      activeView,
      navigationHistory: [createNavigationSnapshot(state), ...state.navigationHistory].slice(0, 20)
    };
  }),
  setNavMode: (navMode) => {
    const normalizedMode = navMode === 'compact' ? 'compact' : 'expanded';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('revival-nav-mode', normalizedMode);
    }
    set({ navMode: normalizedMode });
  },
  toggleNavMode: () => {
    const nextMode = get().navMode === 'compact' ? 'expanded' : 'compact';
    get().setNavMode(nextMode);
  },
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  setActiveEpisodeId: (activeEpisodeId) => set({ activeEpisodeId }),
  setActiveEpisodeSeason: (activeEpisodeSeason) => set({ activeEpisodeSeason }),
  setActiveCharacterId: (activeCharacterId) => set({ activeCharacterId }),
  setActiveDecisionId: (activeDecisionId) => set({ activeDecisionId }),
  setActiveQuestionId: (activeQuestionId) => set({ activeQuestionId }),
  setActiveContextPackId: (activeContextPackId) => set({ activeContextPackId }),
  setActiveCandidateId: (activeCandidateId) => set({ activeCandidateId }),
  setActiveAiSessionId: (activeAiSessionId) => {
    persistActiveAiSessionId(activeAiSessionId);
    set({ activeAiSessionId });
  },
  clearSourceSessionJump: () => set({ sourceSessionJump: null }),
  setContextPackSessionContext: (contextPackId, sessionContext) => set((state) => ({
    contextPackSessionContexts: {
      ...state.contextPackSessionContexts,
      [contextPackId]: sessionContext
    }
  })),
  setActiveTimelineEventId: (activeTimelineEventId) => set({ activeTimelineEventId }),
  setActiveLivingDocType: (activeLivingDocType) => {
    const entries = get().livingDocs[activeLivingDocType] || [];
    set({
      activeLivingDocType,
      activeLivingDocEntryId: entries[0]?.id || null
    });
  },
  selectLivingDocEntry: async (entryId) => {
    const api = window.revival;
    if (!api || !entryId) return;

    const existingEntry = Object.values(get().livingDocs)
      .flat()
      .find((entry) => String(entry.id) === String(entryId));
    const entry = existingEntry || await api.living.getEntry(entryId);
    if (!entry) {
      set({ activeView: 'living-docs' });
      return;
    }

    if (!existingEntry) {
      set((state) => ({
        livingDocs: groupLivingDocs([...Object.values(state.livingDocs).flat(), entry])
      }));
    }

    set({
      activeView: 'living-docs',
      activeLivingDocType: entry.doc_type,
      activeLivingDocEntryId: entry.id
    });
  },
  toggleExpandedNode: (nodeId) => {
    const expandedNodes = get().expandedNodes;
    set({
      expandedNodes: expandedNodes.includes(nodeId)
        ? expandedNodes.filter((id) => id !== nodeId)
        : [...expandedNodes, nodeId]
    });
  },
  setNodeExpanded: (nodeId, expanded) => {
    const expandedNodes = get().expandedNodes;
    const alreadyExpanded = expandedNodes.includes(nodeId);

    if (expanded && !alreadyExpanded) {
      set({ expandedNodes: [...expandedNodes, nodeId] });
    }

    if (!expanded && alreadyExpanded) {
      set({ expandedNodes: expandedNodes.filter((id) => id !== nodeId) });
    }
  },
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  openAiPanel: (aiPanelTab = 'ask') => set({ aiPanelOpen: true, aiPanelTab }),
  closeAiPanel: () => set({ aiPanelOpen: false }),
  setAiPanelTab: (aiPanelTab) => set({ aiPanelTab }),
  goBack: () => {
    const [previous, ...rest] = get().navigationHistory;
    if (!previous) return;

    set({
      ...previous,
      navigationHistory: rest,
      navigationFocusTick: get().navigationFocusTick + 1
    });
  },
  setHasUnsaved: (hasUnsaved) => set({ hasUnsaved }),
  setStreamingState: (streamingState) => set({ streamingState }),
  showToast: (toastMessage) => {
    const message = String(toastMessage || '');
    const id = Date.now();
    set({
      toastMessage: message,
      toastId: id,
      lastToastMessage: message,
      lastToastId: id
    });
  },
  clearToast: () => set({ toastMessage: '' }),
  setNeedsApiKey: (needsApiKey) => set({ needsApiKey }),
  setDatabaseInfo: (databaseInfo) => set({ databaseInfo }),
  setSaveState: (saveState) => set((state) => ({
    saveState: { ...state.saveState, ...saveState }
  })),
  markSaving: (label = 'Saving changes') => set({ saveState: { label, savedAt: null, status: 'saving' } }),
  markSaveFailed: (label = 'Autosave failed') => set({ saveState: { label, savedAt: new Date().toISOString(), status: 'failed' } }),
  markSaved: (label = 'Saved') => set({ saveState: { label, savedAt: new Date().toISOString(), status: 'saved' } }),
  loadNodeTree: async () => {
    const nodeTree = await window.revival?.nodes.getTree();
    set({ nodeTree: nodeTree || [] });
    return nodeTree || [];
  },
  selectNode: async (nodeId) => {
    const api = window.revival;
    if (!api || !nodeId) return;

    const [selectedNode, selectedNodeContent] = await Promise.all([
      api.nodes.get(nodeId),
      api.content.get(nodeId)
    ]);

    set({
      activeView: 'bible',
      activeNodeId: nodeId,
      selectedNode: selectedNode || null,
      selectedNodeContent: selectedNodeContent || null
    });
  },
  loadSelectedNodeContent: async () => {
    const api = window.revival;
    const nodeId = get().activeNodeId;
    if (!api || !nodeId) return null;

    const selectedNodeContent = await api.content.get(nodeId);
    set({ selectedNodeContent: selectedNodeContent || null });
    return selectedNodeContent || null;
  },
  loadCharacters: async () => {
    const characters = await window.revival?.characters.getAll();
    set({ characters: characters || [] });
    return characters || [];
  },
  loadEpisodes: async () => {
    const episodes = await window.revival?.episodes.getAll();
    set({ episodes: episodes || [] });
    return episodes || [];
  },
  loadDecisions: async () => {
    const decisions = await window.revival?.decisions.getAll();
    const activeDecisionId = get().activeDecisionId || decisions?.[0]?.id || null;
    set({ decisions: decisions || [], activeDecisionId });
    return decisions || [];
  },
  createDecision: async (payload) => {
    get().markSaving();
    const response = await window.revival?.decisions.create(payload);
    if (!response?.ok || !response.record) {
      get().markSaveFailed(response?.message || 'Decision autosave failed');
      return response;
    }
    set((state) => ({
      activeView: 'decisions',
      activeDecisionId: response.record.id,
      decisions: [...state.decisions, response.record].sort((a, b) => a.tier - b.tier || a.sequence_number - b.sequence_number)
    }));
    get().markSaved('Decision saved');
    return response;
  },
  deleteDecision: async (decisionId) => {
    get().markSaving();
    const response = await window.revival?.decisions.delete(decisionId);
    if (!response?.ok) {
      get().markSaveFailed(response?.message || 'Decision delete failed');
      return response;
    }
    set((state) => {
      const decisions = state.decisions.filter((decision) => String(decision.id) !== String(decisionId));
      return {
        decisions,
        activeDecisionId: String(state.activeDecisionId) === String(decisionId) ? decisions[0]?.id || null : state.activeDecisionId
      };
    });
    get().markSaved('Decision deleted');
    return response;
  },
  selectDecision: async (decisionId) => {
    const api = window.revival;
    if (!api || !decisionId) return;

    const localDecision = get().decisions.find((decision) => String(decision.id) === String(decisionId));
    const decisionLinks = await api.links.getEntityLinks({ entityType: 'decision', entityId: decisionId });
    set({
      activeView: 'decisions',
      activeDecisionId: decisionId,
      entityLinksByKey: {
        ...get().entityLinksByKey,
        [`decision:${decisionId}`]: decisionLinks || []
      }
    });

    if (!localDecision) {
      const decision = await api.decisions.get(decisionId);
      if (decision) {
        set((state) => ({
          decisions: state.decisions.some((item) => item.id === decision.id)
            ? state.decisions
            : [...state.decisions, decision].sort((a, b) => a.tier - b.tier || a.sequence_number - b.sequence_number)
        }));
      }
    }
  },
  loadQuestions: async () => {
    const questions = await window.revival?.questions.getAll();
    const activeQuestionId = get().activeQuestionId || questions?.[0]?.id || null;
    set({ questions: questions || [], activeQuestionId });
    return questions || [];
  },
  createQuestion: async (payload) => {
    get().markSaving();
    const response = await window.revival?.questions.create(payload);
    if (!response?.ok || !response.record) {
      get().markSaveFailed(response?.message || 'Question autosave failed');
      return response;
    }
    set((state) => ({
      activeView: 'questions',
      activeQuestionId: response.record.id,
      questions: [...state.questions, response.record]
    }));
    get().markSaved('Question saved');
    return response;
  },
  deleteQuestion: async (questionId) => {
    get().markSaving();
    const response = await window.revival?.questions.delete(questionId);
    if (!response?.ok) {
      get().markSaveFailed(response?.message || 'Question delete failed');
      return response;
    }
    set((state) => {
      const questions = state.questions.filter((question) => String(question.id) !== String(questionId));
      return {
        questions,
        activeQuestionId: String(state.activeQuestionId) === String(questionId) ? questions[0]?.id || null : state.activeQuestionId
      };
    });
    get().markSaved('Question deleted');
    return response;
  },
  loadContextPacks: async () => {
    const contextPacks = await window.revival?.contextPacks.getAll();
    const activeContextPackId = get().activeContextPackId || contextPacks?.[0]?.id || null;
    set({ contextPacks: contextPacks || [], activeContextPackId });
    return contextPacks || [];
  },
  createContextPack: async (payload) => {
    const response = await window.revival?.contextPacks.create(payload);
    if (!response?.ok || !response.pack) return response;
    await get().loadContextPacks();
    set({ activeView: 'context-packs', activeContextPackId: response.pack.id });
    return response;
  },
  updateContextPack: async (payload) => {
    const response = await window.revival?.contextPacks.update(payload);
    if (!response?.ok || !response.pack) return response;
    set((state) => ({
      contextPacks: replaceById(state.contextPacks, response.pack)
    }));
    return response;
  },
  deleteContextPack: async (contextPackId) => {
    const response = await window.revival?.contextPacks.delete(contextPackId);
    if (!response?.ok) return response;
    const contextPacks = await get().loadContextPacks();
    set((state) => {
      const contextPackSessionContexts = { ...state.contextPackSessionContexts };
      delete contextPackSessionContexts[contextPackId];
      return { activeContextPackId: contextPacks[0]?.id || null, contextPackSessionContexts };
    });
    return response;
  },
  addContextPackLink: async (payload) => {
    const response = await window.revival?.contextPacks.addLink(payload);
    if (!response?.ok || !response.pack) return response;
    set((state) => ({
      contextPacks: replaceById(state.contextPacks, response.pack)
    }));
    return response;
  },
  removeContextPackLink: async (linkId) => {
    const response = await window.revival?.contextPacks.removeLink(linkId);
    if (!response?.ok || !response.pack) return response;
    set((state) => ({
      contextPacks: replaceById(state.contextPacks, response.pack)
    }));
    return response;
  },
  loadAiSessions: async () => {
    const aiSessions = await window.revival?.ai.listSessions();
    const activeAiSessionId = get().activeAiSessionId || getSavedActiveAiSessionId();
    const activeAiSession = activeAiSessionId
      ? aiSessions?.find((session) => String(session.id) === String(activeAiSessionId))
      : null;
    const nextActiveAiSession = activeAiSession || aiSessions?.[0] || null;
    persistActiveAiSessionId(nextActiveAiSession?.id || null);
    set({
      aiSessions: aiSessions || [],
      activeAiSessionId: nextActiveAiSession?.id || null,
      activeAiSession: nextActiveAiSession
    });
    return aiSessions || [];
  },
  loadCandidates: async () => {
    const candidates = window.revival?.candidates?.getAll
      ? await window.revival.candidates.getAll()
      : getLocalCandidates();
    const activeCandidateId = get().activeCandidateId || candidates?.[0]?.id || null;
    set({ candidates: candidates || [], activeCandidateId });
    return candidates || [];
  },
  selectCandidate: async (candidateId) => {
    const api = window.revival;
    if (!candidateId) return null;

    const localCandidate = get().candidates.find((candidate) => String(candidate.id) === String(candidateId));
    const candidate = localCandidate || await api?.candidates?.get(candidateId) || getLocalCandidates().find((item) => String(item.id) === String(candidateId));
    set({
      activeView: 'candidates',
      activeCandidateId: candidate?.id || candidateId
    });
    return candidate || null;
  },
  openCandidateSourceSession: async (candidate) => {
    const provenance = candidate?.provenance_metadata || {};
    const sourceId = provenance.source_id;
    if (!sourceId || provenance.source !== 'AI Session') {
      return { ok: false, message: 'No source AI session is linked.' };
    }

    set((state) => ({
      sourceSessionJump: {
        sessionId: sourceId,
        text: String(candidate.content || '').trim(),
        requestedAt: Date.now()
      },
      navigationHistory: [createNavigationSnapshot(state), ...state.navigationHistory].slice(0, 20)
    }));
    const session = await get().selectAiSession(sourceId);
    return session
      ? { ok: true, session }
      : { ok: false, message: 'Source AI session could not be opened.' };
  },
  createCandidate: async (payload) => {
    const response = window.revival?.candidates?.create
      ? await window.revival.candidates.create(payload)
      : createLocalCandidate(payload);
    if (!response?.ok || !response.candidate) return response;
    await get().loadCandidates();
    set({ activeView: 'candidates', activeCandidateId: response.candidate.id });
    get().markSaved('Candidate saved');
    return response;
  },
  updateCandidateStatus: async ({ id, status }) => {
    const response = window.revival?.candidates?.updateStatus
      ? await window.revival.candidates.updateStatus({ id, status })
      : updateLocalCandidateStatus({ id, status });
    if (!response?.ok || !response.candidate) return response;
    set((state) => ({
      candidates: replaceById(state.candidates, response.candidate),
      activeCandidateId: response.candidate.id
    }));
    get().markSaved('Candidate saved');
    return response;
  },
  updateCandidate: async (payload) => {
    const response = window.revival?.candidates?.update
      ? await window.revival.candidates.update(payload)
      : updateLocalCandidate(payload);
    if (!response?.ok || !response.candidate) return response;
    set((state) => ({
      candidates: replaceById(state.candidates, response.candidate),
      activeCandidateId: response.candidate.id
    }));
    get().markSaved('Candidate saved');
    return response;
  },
  deleteCandidate: async (candidateId) => {
    if (!candidateId) return { ok: false, message: 'Candidate is required.' };

    const response = window.revival?.candidates?.delete
      ? await window.revival.candidates.delete(candidateId)
      : deleteLocalCandidate(candidateId);
    if (!response?.ok) return response;

    const candidates = await get().loadCandidates();
    const nextCandidate = candidates.find((candidate) => String(candidate.id) !== String(candidateId)) || null;
    set({
      activeCandidateId: nextCandidate?.id || null
    });
    get().markSaved('Candidate deleted');
    return response;
  },
  selectAiSession: async (sessionId) => {
    if (!sessionId) {
      persistActiveAiSessionId(null);
      set({ activeAiSessionId: null, activeAiSession: null });
      return null;
    }

    const localSession = get().aiSessions.find((session) => String(session.id) === String(sessionId));
    const activeAiSession = localSession || await window.revival?.ai.getSession(sessionId);
    persistActiveAiSessionId(activeAiSession?.id || null);
    set({
      activeView: 'session',
      activeAiSessionId: activeAiSession?.id || null,
      activeAiSession: activeAiSession || null
    });
    return activeAiSession || null;
  },
  createAiSession: async (payload) => {
    const response = await window.revival?.ai.createSession(payload);
    if (!response?.ok || !response.session) return response;
    await get().loadAiSessions();
    set({
      activeView: 'session',
      activeAiSessionId: response.session.id,
      activeAiSession: response.session
    });
    persistActiveAiSessionId(response.session.id);
    return response;
  },
  deleteAiSession: async (sessionId) => {
    if (!sessionId) return { ok: false, message: 'AI session is required.' };

    if (!window.revival?.ai?.deleteSession) {
      return { ok: false, message: 'AI session delete API is unavailable. Restart the app and try again.' };
    }

    let response;
    try {
      response = await window.revival.ai.deleteSession(sessionId);
    } catch (error) {
      return { ok: false, message: error?.message || 'AI session delete failed.' };
    }

    if (!response?.ok) return response;

    const aiSessions = await window.revival?.ai.listSessions();
    const nextActiveSession = aiSessions?.find((session) => String(session.id) !== String(sessionId)) || null;
    persistActiveAiSessionId(nextActiveSession?.id || null);
    set({
      aiSessions: aiSessions || [],
      activeAiSessionId: nextActiveSession?.id || null,
      activeAiSession: nextActiveSession
    });
    return response;
  },
  selectQuestion: async (questionId) => {
    const api = window.revival;
    if (!api || !questionId) return;

    const localQuestion = get().questions.find((question) => String(question.id) === String(questionId));
    set({
      activeView: 'questions',
      activeQuestionId: questionId
    });

    if (!localQuestion) {
      const question = await api.questions.get(questionId);
      if (question) {
        set((state) => ({
          questions: state.questions.some((item) => item.id === question.id)
            ? state.questions
            : [...state.questions, question]
        }));
      }
    }
  },
  loadLivingDocs: async () => {
    const livingRows = await window.revival?.living.getAll();
    const livingDocs = groupLivingDocs(livingRows || []);
    const activeLivingDocType = get().activeLivingDocType || 'rewatch_ledger';
    set({
      livingDocs,
      activeLivingDocType,
      activeLivingDocEntryId: get().activeLivingDocEntryId || livingDocs[activeLivingDocType]?.[0]?.id || null
    });
    return livingDocs;
  },
  loadTimelineEvents: async () => {
    const timelineEvents = await window.revival?.timeline.getEvents();
    const activeTimelineEventId = get().activeTimelineEventId || timelineEvents?.[0]?.id || null;
    set({ timelineEvents: timelineEvents || [], activeTimelineEventId });
    return timelineEvents || [];
  },
  loadCanonTags: async () => {
    const [canonTags, entityTagLinks] = await Promise.all([
      window.revival?.canon.getTags(),
      window.revival?.canon.getEntityTagLinks()
    ]);
    const entityTagsByKey = groupEntityTags(entityTagLinks || []);
    set({ canonTags: canonTags || [], entityTagsByKey });
    return entityTagsByKey;
  },
  addTagToEntity: async ({ entityType, entityId, tag }) => {
    const response = await window.revival?.canon.addEntityTag({ entityType, entityId, tag });
    if (!response?.ok) return response;
    await get().loadCanonTags();
    return response;
  },
  removeTagFromEntity: async ({ entityType, entityId, tagSlug }) => {
    const response = await window.revival?.canon.removeEntityTag({ entityType, entityId, tagSlug });
    if (!response?.ok) return response;
    await get().loadCanonTags();
    return response;
  },
  updateEntityStatus: async ({ entityType, entityId, status }) => {
    const response = await window.revival?.canon.updateEntityStatus({ entityType, entityId, status });
    if (!response?.ok || !response.record) return response;
    set((state) => applyEntityRecordUpdate(state, entityType, response.record));
    return response;
  },
  updateDecisionResolution: async (payload) => {
    get().markSaving();
    const response = await window.revival?.decisions.updateResolution(payload);
    if (!response?.ok || !response.record) {
      get().markSaveFailed(response?.message || 'Decision autosave failed');
      return response;
    }
    set((state) => applyEntityRecordUpdate(state, 'decision', response.record));
    get().markSaved('Decision saved');
    return response;
  },
  updateQuestionResolution: async (payload) => {
    get().markSaving();
    const response = await window.revival?.questions.updateResolution(payload);
    if (!response?.ok || !response.record) {
      get().markSaveFailed(response?.message || 'Question autosave failed');
      return response;
    }
    set((state) => applyEntityRecordUpdate(state, 'question', response.record));
    get().markSaved('Question saved');
    return response;
  },
  loadEntityLinks: async ({ entityType, entityId }) => {
    if (!entityType || !entityId) return [];
    const links = await window.revival?.links.getEntityLinks({ entityType, entityId });
    set((state) => ({
      entityLinksByKey: {
        ...state.entityLinksByKey,
        [`${entityType}:${entityId}`]: links || []
      }
    }));
    return links || [];
  },
  addEntityLink: async (payload) => {
    const response = await window.revival?.links.addEntityLink(payload);
    if (!response?.ok) return response;
    await get().loadEntityLinks({ entityType: payload.sourceType, entityId: payload.sourceId });
    await get().loadEntityLinks({ entityType: payload.targetType, entityId: payload.targetId });
    return response;
  },
  removeEntityLink: async ({ linkId, entityType, entityId }) => {
    const response = await window.revival?.links.removeEntityLink(linkId);
    if (!response?.ok) return response;
    if (entityType && entityId) {
      await get().loadEntityLinks({ entityType, entityId });
    }
    return response;
  },
  selectTimelineEvent: async (timelineEventId) => {
    if (!timelineEventId) return;
    set({
      activeView: 'timeline',
      activeTimelineEventId: timelineEventId
    });
  },
  selectEpisode: async (episodeId) => {
    const api = window.revival;
    if (!api || !episodeId) return;
    const localEpisode = get().episodes.find((episode) => String(episode.id) === String(episodeId));

    if (localEpisode) {
      set({
        activeView: 'episodes',
        activeEpisodeId: localEpisode.id,
        activeEpisodeSeason: localEpisode.season,
        selectedEpisode: localEpisode
      });
    }

    const selectedEpisode = await api.episodes.get(episodeId);

    set({
      activeView: 'episodes',
      activeEpisodeId: selectedEpisode?.id || episodeId,
      activeEpisodeSeason: selectedEpisode?.season || get().activeEpisodeSeason,
      selectedEpisode: selectedEpisode || localEpisode || null
    });
  },
  selectCharacter: async (characterId) => {
    const api = window.revival;
    if (!api || !characterId) return;

    const [selectedCharacter, selectedCharacterRelationships, selectedCharacterLinks] = await Promise.all([
      api.characters.get(characterId),
      api.characters.getRelationships(characterId),
      api.links.getEntityLinks({ entityType: 'character', entityId: characterId })
    ]);

    set({
      activeView: 'characters',
      activeCharacterId: selectedCharacter?.id || characterId,
      selectedCharacter: selectedCharacter || null,
      selectedCharacterRelationships: selectedCharacterRelationships || [],
      entityLinksByKey: {
        ...get().entityLinksByKey,
        [`character:${selectedCharacter?.id || characterId}`]: selectedCharacterLinks || []
      }
    });
  },
  navigateToEntity: async (entityType, entityId) => {
    await get().navigateToSearchResult({ entity_type: entityType, entity_id: entityId });
  },
  navigateToSearchResult: async (result) => {
    if (!result?.entity_type || !result?.entity_id) return;

    set((state) => ({
      navigationHistory: [createNavigationSnapshot(state), ...state.navigationHistory].slice(0, 20)
    }));

    switch (result.entity_type) {
      case 'episode':
        await get().selectEpisode(result.entity_id);
        break;
      case 'character':
        await get().selectCharacter(result.entity_id);
        break;
      case 'decision':
        await get().selectDecision(result.entity_id);
        break;
      case 'question':
        await get().selectQuestion(result.entity_id);
        break;
      case 'living_document':
        await get().selectLivingDocEntry(result.entity_id);
        break;
      case 'timeline_event':
        await get().selectTimelineEvent(result.entity_id);
        break;
      case 'bible_section': {
        await get().selectNode(result.entity_id);
        break;
      }
      default:
        break;
    }

    set((state) => ({
      expandedNodes: state.expandedNodes.filter((nodeId) => nodeId !== 'story-bible'),
      navigationFocusTick: state.navigationFocusTick + 1
    }));
    get().closeSearch();
  },
  hydratePhaseOneData: async () => {
    const api = window.revival;
    if (!api) {
      const candidates = getLocalCandidates();
      set({ candidates, activeCandidateId: get().activeCandidateId || candidates[0]?.id || null });
      return;
    }

    const [databaseInfo, nodeTree, episodes, characters, decisions, questions, contextPacks, aiSessions, candidates, livingRows, timelineEvents, canonTags, entityTagLinks, characterRelationshipCount] = await Promise.all([
      api.app.getDatabaseInfo(),
      api.nodes.getTree(),
      api.episodes.getAll(),
      api.characters.getAll(),
      api.decisions.getAll(),
      api.questions.getAll(),
      api.contextPacks.getAll(),
      api.ai.listSessions(),
      api.candidates?.getAll() || [],
      api.living.getAll(),
      api.timeline.getEvents(),
      api.canon.getTags(),
      api.canon.getEntityTagLinks(),
      api.characters.getRelationshipCount()
    ]);

    const livingDocs = groupLivingDocs(livingRows || []);
    const entityTagsByKey = groupEntityTags(entityTagLinks || []);

    const hydratedAiSession = getHydratedAiSession(aiSessions, get().activeAiSessionId);

    set({
      databaseInfo,
      nodeTree,
      episodes,
      characters,
      decisions,
      questions,
      contextPacks: contextPacks || [],
      aiSessions: aiSessions || [],
      candidates: candidates || [],
      activeCandidateId: get().activeCandidateId || candidates?.[0]?.id || null,
      activeAiSessionId: hydratedAiSession?.id || null,
      activeAiSession: hydratedAiSession,
      livingDocs,
      timelineEvents: timelineEvents || [],
      canonTags: canonTags || [],
      entityTagsByKey,
      characterRelationshipCount
    });
  }
}));

function groupLivingDocs(rows) {
  const livingDocs = {
    rewatch_ledger: [],
    dread_map: [],
    obligation_ledger: [],
    caroline_map: []
  };

  for (const row of rows) {
    if (!livingDocs[row.doc_type]) {
      livingDocs[row.doc_type] = [];
    }
    livingDocs[row.doc_type].push(row);
  }

  return livingDocs;
}

function groupEntityTags(rows) {
  return rows.reduce((groups, row) => {
    const key = `${row.entity_type}:${row.entity_id}`;
    groups[key] = groups[key] || [];
    groups[key].push(row);
    return groups;
  }, {});
}

function applyEntityRecordUpdate(state, entityType, record) {
  switch (entityType) {
    case 'character':
      return {
        characters: replaceById(state.characters, record),
        selectedCharacter: String(state.selectedCharacter?.id) === String(record.id) ? record : state.selectedCharacter
      };
    case 'decision':
      return {
        decisions: replaceById(state.decisions, record)
      };
    case 'question':
      return {
        questions: replaceById(state.questions, record)
      };
    case 'timeline_event':
      return {
        timelineEvents: replaceById(state.timelineEvents, record)
      };
    case 'living_document':
      return {
        livingDocs: groupLivingDocs(replaceById(Object.values(state.livingDocs).flat(), record))
      };
    default:
      return {};
  }
}

function replaceById(rows, nextRow) {
  return rows.map((row) => (String(row.id) === String(nextRow.id) ? nextRow : row));
}

function getLocalCandidates() {
  if (typeof localStorage === 'undefined') return [];

  try {
    const candidates = JSON.parse(localStorage.getItem(localCandidateStorageKey) || '[]');
    return Array.isArray(candidates) ? candidates : [];
  } catch {
    return [];
  }
}

function persistLocalCandidates(candidates) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(localCandidateStorageKey, JSON.stringify(candidates));
}

function createLocalCandidate(payload = {}) {
  const title = String(payload.title || '').trim();
  if (!title) return { ok: false, message: 'Candidate title is required.' };

  const createdAt = new Date().toISOString();
  const candidate = {
    id: `local-${Date.now()}`,
    title,
    content: String(payload.content || '').trim(),
    status: 'New',
    type: String(payload.type || 'Narrative Note').trim() || 'Narrative Note',
    provenance_metadata: {
      source: payload.provenanceMetadata?.source || 'Manual editorial note',
      source_id: payload.provenanceMetadata?.source_id || '',
      source_title: payload.provenanceMetadata?.source_title || '',
      provider: payload.provenanceMetadata?.provider || '',
      model: payload.provenanceMetadata?.model || '',
      template_id: payload.provenanceMetadata?.template_id || '',
      template: payload.provenanceMetadata?.template || '',
      workflow: payload.provenanceMetadata?.workflow || 'Candidate Inbox',
      created_at: payload.provenanceMetadata?.created_at || createdAt
    },
    suggested_links: Array.isArray(payload.suggestedLinks) ? payload.suggestedLinks : [],
    notes: String(payload.notes || '').trim(),
    created_at: createdAt,
    updated_at: createdAt
  };
  const candidates = [candidate, ...getLocalCandidates()];
  persistLocalCandidates(candidates);
  return { ok: true, candidate };
}

function updateLocalCandidateStatus({ id, status }) {
  const allowedStatuses = new Set(['New', 'In Review', 'Accepted / Needs Placement', 'Promoted', 'Rejected']);
  if (!allowedStatuses.has(status)) return { ok: false, message: 'Candidate status is required.' };

  let updatedCandidate = null;
  const candidates = getLocalCandidates().map((candidate) => {
    if (String(candidate.id) !== String(id)) return candidate;
    updatedCandidate = {
      ...candidate,
      status,
      updated_at: new Date().toISOString()
    };
    return updatedCandidate;
  });

  if (!updatedCandidate) return { ok: false, message: 'Candidate not found.' };
  persistLocalCandidates(candidates);
  return { ok: true, candidate: updatedCandidate };
}

function updateLocalCandidate({ id, title = '', content = '', type = 'Narrative Note', notes = '' } = {}) {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) return { ok: false, message: 'Candidate title is required.' };

  let updatedCandidate = null;
  const candidates = getLocalCandidates().map((candidate) => {
    if (String(candidate.id) !== String(id)) return candidate;
    updatedCandidate = {
      ...candidate,
      title: normalizedTitle,
      content: String(content || '').trim(),
      type: String(type || 'Narrative Note').trim() || 'Narrative Note',
      notes: String(notes || '').trim(),
      updated_at: new Date().toISOString()
    };
    return updatedCandidate;
  });

  if (!updatedCandidate) return { ok: false, message: 'Candidate not found.' };
  persistLocalCandidates(candidates);
  return { ok: true, candidate: updatedCandidate };
}

function deleteLocalCandidate(candidateId) {
  const candidates = getLocalCandidates();
  const nextCandidates = candidates.filter((candidate) => String(candidate.id) !== String(candidateId));
  if (nextCandidates.length === candidates.length) {
    return { ok: false, message: 'Candidate not found.' };
  }

  persistLocalCandidates(nextCandidates);
  return { ok: true, deletedId: candidateId };
}

function getHydratedAiSession(aiSessions = [], preferredSessionId = null) {
  const savedSessionId = preferredSessionId || getSavedActiveAiSessionId();
  const savedSession = savedSessionId
    ? aiSessions.find((session) => String(session.id) === String(savedSessionId))
    : null;
  const nextSession = savedSession || aiSessions[0] || null;
  persistActiveAiSessionId(nextSession?.id || null);
  return nextSession;
}

function createNavigationSnapshot(state) {
  return {
    activeView: state.activeView,
    activeNodeId: state.activeNodeId,
    activeEpisodeId: state.activeEpisodeId,
    activeEpisodeSeason: state.activeEpisodeSeason,
    selectedEpisode: state.selectedEpisode,
    activeCharacterId: state.activeCharacterId,
    selectedCharacter: state.selectedCharacter,
    selectedCharacterRelationships: state.selectedCharacterRelationships,
    activeDecisionId: state.activeDecisionId,
    activeQuestionId: state.activeQuestionId,
    activeContextPackId: state.activeContextPackId,
    activeCandidateId: state.activeCandidateId,
    activeAiSessionId: state.activeAiSessionId,
    activeAiSession: state.activeAiSession,
    activeTimelineEventId: state.activeTimelineEventId,
    activeLivingDocType: state.activeLivingDocType,
    activeLivingDocEntryId: state.activeLivingDocEntryId,
    selectedNode: state.selectedNode,
    selectedNodeContent: state.selectedNodeContent
  };
}

function getNodeParentIds(nodeTree, nodeId) {
  const byId = new Map(nodeTree.map((node) => [String(node.id), node]));
  const parentIds = [];
  let current = byId.get(String(nodeId));

  while (current?.parent_id) {
    parentIds.push(current.parent_id);
    current = byId.get(String(current.parent_id));
  }

  return parentIds;
}
