import { app, BrowserWindow, clipboard, ipcMain, screen, shell } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { addContextPackLink, addEntityLink, addEntityTag, closeDatabase, createCandidate, createContextPack, deleteCandidate, deleteContextPack, ensureSearchIndex, getCandidate, getCandidates, getCanonTags, getCharacter, getCharacterRelationshipCount, getCharacterRelationships, getCharacters, getContextPacks, getDatabaseInfo, getDecision, getDecisionBlockers, getDecisions, getEntityLinks, getEntityTagLinks, getEpisode, getEpisodes, getEpisodesBySeason, getLatestNodeContent, getLivingDocumentEntry, getLivingDocuments, getLivingDocumentsByType, getNode, getNodeTree, getQuestion, getQuestions, getTimelineEvent, getTimelineEvents, initDatabase, removeContextPackLink, removeEntityLink, removeEntityTag, updateCandidateStatus, updateContextPack, updateEntityStatus } from './db.js';
import { getPreferences, hasApiKey, initConfig, setApiKey, setPreferences, testProviderConnection } from './config.js';
import { seedBible } from './seed-bible.js';
import { seedCanonTags } from './seed-canon-tags.js';
import { seedCharacterRelationshipRefinement } from './seed-character-relationships.js';
import { seedEntityLinks } from './seed-entity-links.js';
import { seedEpisodes } from './seed-episodes.js';
import { seedPhase3B } from './seed-phase3b.js';
import { seedTimeline } from './seed-timeline.js';
import { registerAiHandlers } from './ipc-ai.js';
import { registerSearchHandlers } from './ipc-search.js';
import { registerExportHandlers } from './ipc-export.js';
import { registerBridgeHandlers } from './ipc-bridge.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let mainWindow;

function createWindow() {
  const { workArea } = screen.getPrimaryDisplay();

  mainWindow = new BrowserWindow({
    x: workArea.x,
    y: workArea.y,
    width: workArea.width,
    height: workArea.height,
    minWidth: 1100,
    minHeight: 720,
    title: 'Revival Bible v3',
    backgroundColor: '#111111',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.maximize();

  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize();
    mainWindow.show();
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

function registerCoreHandlers() {
  ipcMain.handle('config:has-api-key', async (_event, provider) => hasApiKey(provider));
  ipcMain.handle('config:get-preferences', async () => getPreferences());
  ipcMain.handle('config:set-preferences', async (_event, preferences) => setPreferences(preferences));
  ipcMain.handle('config:set-api-key', async (_event, payload) => setApiKey(payload));
  ipcMain.handle('config:test-provider-connection', async (_event, provider) => testProviderConnection(provider));
  ipcMain.handle('app:get-database-info', async () => getDatabaseInfo());
  ipcMain.handle('clipboard:write-text', async (_event, text) => {
    clipboard.writeText(String(text || ''));
    return { ok: true };
  });

  ipcMain.handle('nodes:get-tree', async () => getNodeTree());
  ipcMain.handle('nodes:get', async (_event, id) => getNode(id));
  ipcMain.handle('content:get', async (_event, nodeId) => getLatestNodeContent(nodeId));
  ipcMain.handle('episodes:get-all', async () => getEpisodes());
  ipcMain.handle('episodes:get-by-season', async (_event, season) => getEpisodesBySeason(season));
  ipcMain.handle('episodes:get', async (_event, id) => getEpisode(id));
  ipcMain.handle('characters:get-all', async () => getCharacters());
  ipcMain.handle('characters:get', async (_event, id) => getCharacter(id));
  ipcMain.handle('characters:get-relationships', async (_event, id) => getCharacterRelationships(id));
  ipcMain.handle('characters:get-relationship-count', async () => getCharacterRelationshipCount());
  ipcMain.handle('decisions:get-all', async () => getDecisions());
  ipcMain.handle('decisions:get', async (_event, id) => getDecision(id));
  ipcMain.handle('decisions:get-blockers', async (_event, id) => getDecisionBlockers(id));
  ipcMain.handle('questions:get-all', async () => getQuestions());
  ipcMain.handle('questions:get', async (_event, id) => getQuestion(id));
  ipcMain.handle('living:get-all', async () => getLivingDocuments());
  ipcMain.handle('living:get-by-type', async (_event, docType) => getLivingDocumentsByType(docType));
  ipcMain.handle('living:get-entry', async (_event, id) => getLivingDocumentEntry(id));
  ipcMain.handle('timeline:get-events', async () => getTimelineEvents());
  ipcMain.handle('timeline:get-event', async (_event, id) => getTimelineEvent(id));
  ipcMain.handle('canon:get-tags', async () => getCanonTags());
  ipcMain.handle('canon:get-entity-tag-links', async () => getEntityTagLinks());
  ipcMain.handle('canon:add-entity-tag', async (_event, payload) => addEntityTag(payload?.entityType, payload?.entityId, payload?.tag));
  ipcMain.handle('canon:remove-entity-tag', async (_event, payload) => removeEntityTag(payload?.entityType, payload?.entityId, payload?.tagSlug));
  ipcMain.handle('canon:update-entity-status', async (_event, payload) => updateEntityStatus(payload?.entityType, payload?.entityId, payload?.status));
  ipcMain.handle('links:get-entity-links', async (_event, payload) => getEntityLinks(payload?.entityType, payload?.entityId));
  ipcMain.handle('links:add-entity-link', async (_event, payload) => addEntityLink(payload));
  ipcMain.handle('links:remove-entity-link', async (_event, linkId) => removeEntityLink(linkId));
  ipcMain.handle('context-packs:get-all', async () => getContextPacks());
  ipcMain.handle('context-packs:create', async (_event, payload) => createContextPack(payload));
  ipcMain.handle('context-packs:update', async (_event, payload) => updateContextPack(payload?.id, payload));
  ipcMain.handle('context-packs:delete', async (_event, id) => deleteContextPack(id));
  ipcMain.handle('context-packs:add-link', async (_event, payload) => addContextPackLink(payload));
  ipcMain.handle('context-packs:remove-link', async (_event, linkId) => removeContextPackLink(linkId));
  ipcMain.handle('candidates:get-all', async () => getCandidates());
  ipcMain.handle('candidates:get', async (_event, id) => getCandidate(id));
  ipcMain.handle('candidates:create', async (_event, payload) => createCandidate(payload));
  ipcMain.handle('candidates:update-status', async (_event, payload) => updateCandidateStatus(payload?.id, payload?.status));
  ipcMain.handle('candidates:delete', async (_event, id) => deleteCandidate(id));
}

app.whenReady().then(() => {
  initConfig(app);
  initDatabase(app);
  const seedResult = seedBible();
  console.info(`[Revival Bible v3] Phase 2 bible seed checked: ${JSON.stringify(seedResult)}`);
  const episodeSeedResult = seedEpisodes();
  console.info(`[Revival Bible v3] Phase 3A episode seed checked: ${JSON.stringify(episodeSeedResult)}`);
  const characterRelationshipSeedResult = seedCharacterRelationshipRefinement();
  console.info(`[Revival Bible v3] Phase 5B relationship seed checked: ${JSON.stringify(characterRelationshipSeedResult)}`);
  const phase3BSeedResult = seedPhase3B();
  console.info(`[Revival Bible v3] Phase 3B seed checked: ${JSON.stringify(phase3BSeedResult)}`);
  const timelineSeedResult = seedTimeline();
  console.info(`[Revival Bible v3] Phase 5A timeline seed checked: ${JSON.stringify(timelineSeedResult)}`);
  const canonTagSeedResult = seedCanonTags();
  console.info(`[Revival Bible v3] Phase 5C canon tag seed checked: ${JSON.stringify(canonTagSeedResult)}`);
  const entityLinkSeedResult = seedEntityLinks();
  console.info(`[Revival Bible v3] Phase 8 entity link seed checked: ${JSON.stringify(entityLinkSeedResult)}`);
  const searchIndexResult = ensureSearchIndex();
  console.info(`[Revival Bible v3] Search index checked: ${JSON.stringify(searchIndexResult)}`);
  registerCoreHandlers();
  registerAiHandlers(ipcMain);
  registerSearchHandlers(ipcMain);
  registerExportHandlers(ipcMain);
  registerBridgeHandlers(ipcMain, { shell, BrowserWindow });
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  closeDatabase();
});
