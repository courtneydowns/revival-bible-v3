import { clearSearchIndex, querySearchIndex } from './db.js';

export function registerSearchHandlers(ipcMain) {
  ipcMain.handle('search:query', async (_event, query) => ({
    ok: true,
    results: querySearchIndex(query)
  }));

  ipcMain.handle('search:rebuild-index', async () => ({
    ok: true,
    phase: 1,
    ...clearSearchIndex(),
    message: 'Search index rebuild is a Phase 1 placeholder until story data is seeded.'
  }));
}
