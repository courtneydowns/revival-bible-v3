export function registerBridgeHandlers(ipcMain, { shell, BrowserWindow }) {
  ipcMain.handle('shell:open-path', async (_event, targetPath) => {
    if (!targetPath) {
      return { ok: false, message: 'No path provided.' };
    }

    const error = await shell.openPath(targetPath);
    return { ok: !error, error };
  });

  ipcMain.handle('window:open-popout', async () => {
    return {
      ok: true,
      phase: 1,
      availableWindows: BrowserWindow.getAllWindows().length,
      message: 'Popout windows are stubbed for Phase 1.'
    };
  });
}
