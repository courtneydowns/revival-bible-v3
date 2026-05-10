import { create } from 'zustand';

const initialLivingDocs = {
  rewatch_ledger: [],
  dread_map: [],
  obligation_ledger: [],
  caroline_map: []
};

export const useRevivalStore = create((set, get) => ({
  activeView: 'dashboard',
  activeNodeId: null,
  activeEpisodeId: null,
  activeEpisodeSeason: 1,
  activeCharacterId: null,
  activeDecisionId: null,
  activeQuestionId: null,
  activeContextPackId: null,
  activeTimelineEventId: null,
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
  navigationHistory: [],
  navigationFocusTick: 0,
  databaseInfo: {
    connected: false,
    path: ''
  },

  setActiveView: (activeView) => set((state) => {
    if (state.activeView === activeView) return {};

    return {
      activeView,
      navigationHistory: [createNavigationSnapshot(state), ...state.navigationHistory].slice(0, 20)
    };
  }),
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  setActiveEpisodeId: (activeEpisodeId) => set({ activeEpisodeId }),
  setActiveEpisodeSeason: (activeEpisodeSeason) => set({ activeEpisodeSeason }),
  setActiveCharacterId: (activeCharacterId) => set({ activeCharacterId }),
  setActiveDecisionId: (activeDecisionId) => set({ activeDecisionId }),
  setActiveQuestionId: (activeQuestionId) => set({ activeQuestionId }),
  setActiveContextPackId: (activeContextPackId) => set({ activeContextPackId }),
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
  setNeedsApiKey: (needsApiKey) => set({ needsApiKey }),
  setDatabaseInfo: (databaseInfo) => set({ databaseInfo }),
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
    set({ activeContextPackId: contextPacks[0]?.id || null });
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
    if (!api) return;

    const [databaseInfo, nodeTree, episodes, characters, decisions, questions, contextPacks, livingRows, timelineEvents, canonTags, entityTagLinks, characterRelationshipCount] = await Promise.all([
      api.app.getDatabaseInfo(),
      api.nodes.getTree(),
      api.episodes.getAll(),
      api.characters.getAll(),
      api.decisions.getAll(),
      api.questions.getAll(),
      api.contextPacks.getAll(),
      api.living.getAll(),
      api.timeline.getEvents(),
      api.canon.getTags(),
      api.canon.getEntityTagLinks(),
      api.characters.getRelationshipCount()
    ]);

    const livingDocs = groupLivingDocs(livingRows || []);
    const entityTagsByKey = groupEntityTags(entityTagLinks || []);

    set({ databaseInfo, nodeTree, episodes, characters, decisions, questions, contextPacks: contextPacks || [], livingDocs, timelineEvents: timelineEvents || [], canonTags: canonTags || [], entityTagsByKey, characterRelationshipCount });
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
