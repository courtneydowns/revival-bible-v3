import { querySearchIndex, rebuildSearchIndex } from './db.js';

export function registerSearchHandlers(ipcMain) {
  ipcMain.handle('search:query', async (_event, query) => ({
    ok: true,
    results: querySearchIndex(query)
  }));

  ipcMain.handle('search:rebuild-index', async () => ({
    ok: true,
    ...rebuildSearchIndex(),
    message: 'Search index rebuilt from local story bible data.'
  }));
}
