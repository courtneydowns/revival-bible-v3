import { contextBridge, ipcRenderer } from 'electron';

const invoke = (channel, ...args) => ipcRenderer.invoke(channel, ...args);

contextBridge.exposeInMainWorld('revival', {
  config: {
    hasApiKey: (provider) => invoke('config:has-api-key', provider),
    getPreferences: () => invoke('config:get-preferences'),
    setPreferences: (preferences) => invoke('config:set-preferences', preferences),
    setApiKey: (payload) => invoke('config:set-api-key', payload),
    testProviderConnection: (provider) => invoke('config:test-provider-connection', provider)
  },
  app: {
    getDatabaseInfo: () => invoke('app:get-database-info')
  },
  clipboard: {
    writeText: (text) => invoke('clipboard:write-text', text)
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
  canon: {
    getTags: () => invoke('canon:get-tags'),
    getEntityTagLinks: () => invoke('canon:get-entity-tag-links'),
    addEntityTag: (payload) => invoke('canon:add-entity-tag', payload),
    removeEntityTag: (payload) => invoke('canon:remove-entity-tag', payload),
    updateEntityStatus: (payload) => invoke('canon:update-entity-status', payload)
  },
  links: {
    getEntityLinks: (payload) => invoke('links:get-entity-links', payload),
    addEntityLink: (payload) => invoke('links:add-entity-link', payload),
    removeEntityLink: (linkId) => invoke('links:remove-entity-link', linkId)
  },
  contextPacks: {
    getAll: () => invoke('context-packs:get-all'),
    create: (payload) => invoke('context-packs:create', payload),
    update: (payload) => invoke('context-packs:update', payload),
    delete: (id) => invoke('context-packs:delete', id),
    addLink: (payload) => invoke('context-packs:add-link', payload),
    removeLink: (linkId) => invoke('context-packs:remove-link', linkId)
  },
  search: {
    query: (query) => invoke('search:query', query),
    rebuildIndex: () => invoke('search:rebuild-index')
  },
  ai: {
    listSessions: () => invoke('ai:sessions:list'),
    getSession: (id) => invoke('ai:sessions:get', id),
    createSession: (payload) => invoke('ai:sessions:create', payload),
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
