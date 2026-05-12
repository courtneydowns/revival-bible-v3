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
  recovery: {
    createSnapshot: (payload) => invoke('recovery:create-snapshot', payload),
    listSnapshots: () => invoke('recovery:list-snapshots'),
    restoreSnapshot: (payload) => invoke('recovery:restore-snapshot', payload)
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
    getBlockers: (id) => invoke('decisions:get-blockers', id),
    create: (payload) => invoke('decisions:create', payload),
    delete: (id) => invoke('decisions:delete', id),
    updateResolution: (payload) => invoke('decisions:update-resolution', payload)
  },
  questions: {
    getAll: () => invoke('questions:get-all'),
    get: (id) => invoke('questions:get', id),
    create: (payload) => invoke('questions:create', payload),
    delete: (id) => invoke('questions:delete', id),
    updateResolution: (payload) => invoke('questions:update-resolution', payload)
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
  candidates: {
    getAll: () => invoke('candidates:get-all'),
    get: (id) => invoke('candidates:get', id),
    create: (payload) => invoke('candidates:create', payload),
    update: (payload) => invoke('candidates:update', payload),
    updateStatus: (payload) => invoke('candidates:update-status', payload),
    promote: (payload) => invoke('candidates:promote', payload),
    delete: (id) => invoke('candidates:delete', id)
  },
  ingestion: {
    getReviewSummary: () => invoke('ingestion:get-review-summary'),
    createSession: (payload) => invoke('ingestion:create-session', payload),
    createSourceRecord: (payload) => invoke('ingestion:create-source-record', payload),
    createExtraction: (payload) => invoke('ingestion:create-extraction', payload),
    createDuplicateLink: (payload) => invoke('ingestion:create-duplicate-link', payload),
    updateDuplicateReview: (payload) => invoke('ingestion:update-duplicate-review', payload),
    createContinuityReview: (payload) => invoke('ingestion:create-continuity-review', payload),
    updateContinuityReview: (payload) => invoke('ingestion:update-continuity-review', payload),
    createNarrativeFragment: (payload) => invoke('ingestion:create-narrative-fragment', payload)
  },
  search: {
    query: (query) => invoke('search:query', query),
    rebuildIndex: () => invoke('search:rebuild-index')
  },
  ai: {
    listSessions: () => invoke('ai:sessions:list'),
    getSession: (id) => invoke('ai:sessions:get', id),
    createSession: (payload) => invoke('ai:sessions:create', payload),
    deleteSession: (id) => invoke('ai:sessions:delete', id),
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
