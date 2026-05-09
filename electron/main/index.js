import { app, BrowserWindow, ipcMain, shell } from 'electron';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDatabase, getCharacter, getCharacterRelationshipCount, getCharacterRelationships, getCharacters, getDatabaseInfo, getDecisions, getEpisodes, getLatestNodeContent, getLivingDocuments, getNode, getNodeTree, getQuestions, initDatabase } from './db.js';
import { getPreferences, hasApiKey, setApiKey, setPreferences } from './config.js';
import { seedBible } from './seed-bible.js';
import { registerAiHandlers } from './ipc-ai.js';
import { registerSearchHandlers } from './ipc-search.js';
import { registerExportHandlers } from './ipc-export.js';
import { registerBridgeHandlers } from './ipc-bridge.js';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    title: 'Revival Bible v3',
    backgroundColor: '#111111',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
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
  ipcMain.handle('characters:get-all', async () => getCharacters());
  ipcMain.handle('characters:get', async (_event, id) => getCharacter(id));
  ipcMain.handle('characters:get-relationships', async (_event, id) => getCharacterRelationships(id));
  ipcMain.handle('characters:get-relationship-count', async () => getCharacterRelationshipCount());
  ipcMain.handle('decisions:get-all', async () => getDecisions());
  ipcMain.handle('questions:get-all', async () => getQuestions());
  ipcMain.handle('living:get-all', async () => getLivingDocuments());
}

app.whenReady().then(() => {
  initDatabase(app);
  const seedResult = seedBible();
  console.info(`[Revival Bible v3] Phase 2 bible seed checked: ${JSON.stringify(seedResult)}`);
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
