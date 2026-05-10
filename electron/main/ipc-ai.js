import { createAiSession, getAiSession, getAiSessions } from './db.js';
import { createProviderResponse, getActiveProviderModel } from './config.js';

const placeholder = (feature) => ({
  ok: true,
  phase: 1,
  feature,
  message: 'AI provider architecture is stubbed for Phase 1. No external API call was made.'
});

export function registerAiHandlers(ipcMain) {
  ipcMain.handle('ai:sessions:list', async () => getAiSessions());
  ipcMain.handle('ai:sessions:get', async (_event, id) => getAiSession(id));
  ipcMain.handle('ai:sessions:create', async (_event, payload = {}) => createSingleResponseSession(payload));
  ipcMain.handle('ai:validate-key', async () => placeholder('validate-key'));
  ipcMain.handle('ai:qa', async () => placeholder('qa'));
  ipcMain.handle('ai:draft-assist', async () => placeholder('draft-assist'));
  ipcMain.handle('ai:consistency-check', async () => placeholder('consistency-check'));
  ipcMain.handle('ai:flanagan-scene-test', async () => placeholder('flanagan-scene-test'));
  ipcMain.handle('ai:cancel', async () => placeholder('cancel'));
}

async function createSingleResponseSession({
  contextId = '',
  contextType = 'context_pack',
  prompt = '',
  templateId = '',
  userInstructions = ''
} = {}) {
  const normalizedPrompt = String(prompt || '').trim();
  if (!normalizedPrompt) {
    return { ok: false, message: 'Prompt is required.' };
  }

  const providerResult = await createProviderResponse(normalizedPrompt);
  if (!providerResult?.ok) {
    return providerResult;
  }

  const activeProvider = getActiveProviderModel();
  return createAiSession({
    contextId,
    contextType,
    model: providerResult.model || activeProvider.model,
    prompt: normalizedPrompt,
    provider: providerResult.provider || activeProvider.provider,
    response: providerResult.response,
    templateId,
    userInstructions
  });
}
