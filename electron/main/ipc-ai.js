const placeholder = (feature) => ({
  ok: true,
  phase: 1,
  feature,
  message: 'AI provider architecture is stubbed for Phase 1. No external API call was made.'
});

export function registerAiHandlers(ipcMain) {
  ipcMain.handle('ai:validate-key', async () => placeholder('validate-key'));
  ipcMain.handle('ai:qa', async () => placeholder('qa'));
  ipcMain.handle('ai:draft-assist', async () => placeholder('draft-assist'));
  ipcMain.handle('ai:consistency-check', async () => placeholder('consistency-check'));
  ipcMain.handle('ai:flanagan-scene-test', async () => placeholder('flanagan-scene-test'));
  ipcMain.handle('ai:cancel', async () => placeholder('cancel'));
}
