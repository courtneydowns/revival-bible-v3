import { contextBridge, ipcRenderer } from 'electron';

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('revival', {
  config: {
    hasApiKey: (provider) => invoke('config:has-api-key', provider),
    getPreferences: () => invoke('config:get-preferences'),
    setPreferences: (preferences) => invoke('config:set-preferences', preferences),
    setApiKey: (payload) => invoke('config:set-api-key', payload)
  },
  app: {
    getDatabaseInfo: () => invoke('app:get-database-info')
  },
  nodes: {
    getTree: () => invoke('nodes:get-tree'),
    get: (id) => invoke('nodes:get', id)
  },
  content: {
    get: (nodeId) => invoke('content:get', nodeId)
  },
  episodes: {
    getAll: () => invoke('episodes:get-all'),
    getBySeason: (season) => invoke('episodes:get-by-season', season),
    get: (id) => invoke('episodes:get', id)
  },
  characters: {
    getAll: () => invoke('characters:get-all'),
    get: (id) => invoke('characters:get', id),
    getRelationships: (id) => invoke('characters:get-relationships', id),
    getRelationshipCount: () => invoke('characters:get-relationship-count')
  },
  decisions: {
    getAll: () => invoke('decisions:get-all'),
    get: (id) => invoke('decisions:get', id),
    getBlockers: (id) => invoke('decisions:get-blockers', id)
  },
  questions: {
    getAll: () => invoke('questions:get-all'),
    get: (id) => invoke('questions:get', id)
  },
  living: {
    getAll: () => invoke('living:get-all'),
    getByType: (docType) => invoke('living:get-by-type', docType),
    getEntry: (id) => invoke('living:get-entry', id)
  },
  timeline: {
    getEvents: () => invoke('timeline:get-events'),
    getEvent: (id) => invoke('timeline:get-event', id)
  },
  search: {
    query: (query) => invoke('search:query', query),
    rebuildIndex: () => invoke('search:rebuild-index')
  },
  ai: {
    validateKey: (payload) => invoke('ai:validate-key', payload),
    qa: (payload) => invoke('ai:qa', payload),
    draftAssist: (payload) => invoke('ai:draft-assist', payload),
    consistencyCheck: (payload) => invoke('ai:consistency-check', payload),
    flanaganSceneTest: (payload) => invoke('ai:flanagan-scene-test', payload),
    cancel: () => invoke('ai:cancel')
  },
  export: {
    md: (payload) => invoke('export:md', payload),
    docx: (payload) => invoke('export:docx', payload),
    pdf: (payload) => invoke('export:pdf', payload)
  },
  shell: {
    openPath: (targetPath) => invoke('shell:open-path', targetPath)
  },
  window: {
    openPopout: (payload) => invoke('window:open-popout', payload)
  }
});
