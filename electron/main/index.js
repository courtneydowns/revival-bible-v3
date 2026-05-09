import { app, BrowserWindow, ipcMain, screen, shell } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDatabase, ensureSearchIndex, getCharacter, getCharacterRelationshipCount, getCharacterRelationships, getCharacters, getDatabaseInfo, getDecision, getDecisionBlockers, getDecisions, getEpisode, getEpisodes, getEpisodesBySeason, getLatestNodeContent, getLivingDocumentEntry, getLivingDocuments, getLivingDocumentsByType, getNode, getNodeTree, getQuestion, getQuestions, getTimelineEvent, getTimelineEvents, initDatabase } from './db.js';
import { getPreferences, hasApiKey, setApiKey, setPreferences } from './config.js';
import { seedBible } from './seed-bible.js';
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
  ipcMain.handle('app:get-database-info', async () => getDatabaseInfo());

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
}

app.whenReady().then(() => {
  initDatabase(app);
  const seedResult = seedBible();
  console.info(`[Revival Bible v3] Phase 2 bible seed checked: ${JSON.stringify(seedResult)}`);
  const episodeSeedResult = seedEpisodes();
  console.info(`[Revival Bible v3] Phase 3A episode seed checked: ${JSON.stringify(episodeSeedResult)}`);
  const phase3BSeedResult = seedPhase3B();
  console.info(`[Revival Bible v3] Phase 3B seed checked: ${JSON.stringify(phase3BSeedResult)}`);
  const timelineSeedResult = seedTimeline();
  console.info(`[Revival Bible v3] Phase 5A timeline seed checked: ${JSON.stringify(timelineSeedResult)}`);
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
