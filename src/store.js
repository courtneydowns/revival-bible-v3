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
  livingDocs: initialLivingDocs,
  searchOpen: false,
  settingsOpen: false,
  aiPanelOpen: true,
  aiPanelTab: 'ask',
  needsApiKey: false,
  hasUnsaved: false,
  streamingState: null,
  databaseInfo: {
    connected: false,
    path: ''
  },

  setActiveView: (activeView) => set({ activeView }),
  setActiveNodeId: (activeNodeId) => set({ activeNodeId }),
  setActiveEpisodeId: (activeEpisodeId) => set({ activeEpisodeId }),
  setActiveEpisodeSeason: (activeEpisodeSeason) => set({ activeEpisodeSeason }),
  setActiveCharacterId: (activeCharacterId) => set({ activeCharacterId }),
  setActiveDecisionId: (activeDecisionId) => set({ activeDecisionId }),
  setActiveQuestionId: (activeQuestionId) => set({ activeQuestionId }),
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
    set({
      activeView: 'decisions',
      activeDecisionId: decisionId
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

    const [selectedCharacter, selectedCharacterRelationships] = await Promise.all([
      api.characters.get(characterId),
      api.characters.getRelationships(characterId)
    ]);

    set({
      activeView: 'characters',
      activeCharacterId: selectedCharacter?.id || characterId,
      selectedCharacter: selectedCharacter || null,
      selectedCharacterRelationships: selectedCharacterRelationships || []
    });
  },
  navigateToSearchResult: async (result) => {
    if (!result?.entity_type || !result?.entity_id) return;

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
      case 'bible_section': {
        const nodeTree = get().nodeTree.length ? get().nodeTree : await get().loadNodeTree();
        const parentIds = getNodeParentIds(nodeTree || [], result.entity_id);
        set((state) => ({
          expandedNodes: [...new Set([...state.expandedNodes, 'story-bible', ...parentIds])]
        }));
        await get().selectNode(result.entity_id);
        break;
      }
      default:
        break;
    }

    get().closeSearch();
  },
  hydratePhaseOneData: async () => {
    const api = window.revival;
    if (!api) return;

    const [databaseInfo, nodeTree, episodes, characters, decisions, questions, livingRows, characterRelationshipCount] = await Promise.all([
      api.app.getDatabaseInfo(),
      api.nodes.getTree(),
      api.episodes.getAll(),
      api.characters.getAll(),
      api.decisions.getAll(),
      api.questions.getAll(),
      api.living.getAll(),
      api.characters.getRelationshipCount()
    ]);

    const livingDocs = groupLivingDocs(livingRows || []);

    set({ databaseInfo, nodeTree, episodes, characters, decisions, questions, livingDocs, characterRelationshipCount });
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
