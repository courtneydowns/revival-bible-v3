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
  episodes: [],
  characters: [],
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
  hydratePhaseOneData: async () => {
    const api = window.revival;
    if (!api) return;

    const [databaseInfo, nodeTree, episodes, characters, decisions, questions, livingRows] = await Promise.all([
      api.app.getDatabaseInfo(),
      api.nodes.getTree(),
      api.episodes.getAll(),
      api.characters.getAll(),
      api.decisions.getAll(),
      api.questions.getAll(),
      api.living.getAll()
    ]);

    const livingDocs = { ...initialLivingDocs };
    for (const row of livingRows) {
      if (!livingDocs[row.doc_type]) {
        livingDocs[row.doc_type] = [];
      }
      livingDocs[row.doc_type].push(row);
    }

    set({ databaseInfo, nodeTree, episodes, characters, decisions, questions, livingDocs });
  }
}));
