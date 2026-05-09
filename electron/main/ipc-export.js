const exportPlaceholder = (format) => ({
  ok: true,
  phase: 1,
  format,
  path: null,
  message: 'Export logic is stubbed for Phase 1.'
});

export function registerExportHandlers(ipcMain) {
  ipcMain.handle('export:md', async () => exportPlaceholder('md'));
  ipcMain.handle('export:docx', async () => exportPlaceholder('docx'));
  ipcMain.handle('export:pdf', async () => exportPlaceholder('pdf'));
}
