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
  activeCharacterId: null,
  activeDecisionId: null,
  activeQuestionId: null,
  activeLivingDocType: null,
  expandedNodes: [],
  nodeTree: [],
  selectedNode: null,
  selectedNodeContent: null,
  episodes: [],
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
  setActiveCharacterId: (activeCharacterId) => set({ activeCharacterId }),
  setActiveDecisionId: (activeDecisionId) => set({ activeDecisionId }),
  setActiveQuestionId: (activeQuestionId) => set({ activeQuestionId }),
  setActiveLivingDocType: (activeLivingDocType) => set({ activeLivingDocType }),
  toggleExpandedNode: (nodeId) => {
    const expandedNodes = get().expandedNodes;
    set({
      expandedNodes: expandedNodes.includes(nodeId)
        ? expandedNodes.filter((id) => id !== nodeId)
        : [...expandedNodes, nodeId]
    });
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
  selectCharacter: async (characterId) => {
    const api = window.revival;
    if (!api || !characterId) return;

    const [selectedCharacter, selectedCharacterRelationships] = await Promise.all([
      api.characters.get(characterId),
      api.characters.getRelationships(characterId)
    ]);

    set({
      activeView: 'characters',
      activeCharacterId: characterId,
      selectedCharacter: selectedCharacter || null,
      selectedCharacterRelationships: selectedCharacterRelationships || []
    });
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

    const livingDocs = { ...initialLivingDocs };
    for (const row of livingRows) {
      if (!livingDocs[row.doc_type]) {
        livingDocs[row.doc_type] = [];
      }
      livingDocs[row.doc_type].push(row);
    }

    set({ databaseInfo, nodeTree, episodes, characters, decisions, questions, livingDocs, characterRelationshipCount });
  }
}));
