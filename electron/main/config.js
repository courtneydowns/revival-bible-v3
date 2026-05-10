import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ALGORITHM = 'aes-256-gcm';
const KEY_SALT = 'revival-bible-v3-config';
const providerIds = ['anthropic', 'openai'];
const providerLabels = {
  anthropic: 'Claude / Anthropic',
  openai: 'OpenAI'
};
const defaultPreferences = {
  theme: 'dark',
  aiProvider: 'openai',
  aiModels: {
    anthropic: '',
    openai: ''
  }
};
let preferences = { ...defaultPreferences, aiModels: { ...defaultPreferences.aiModels } };
let encryptedApiKeys = {};
let configFilePath = '';
const connectionTestsInFlight = new Map();

export function initConfig(app) {
  configFilePath = join(app.getPath('userData'), 'revival-bible-v3-config.json');

  if (!existsSync(configFilePath)) {
    persistConfig();
    return;
  }

  try {
    const savedConfig = JSON.parse(readFileSync(configFilePath, 'utf8'));
    preferences = normalizePreferences(savedConfig.preferences);
    encryptedApiKeys = normalizeEncryptedApiKeys(savedConfig.encryptedApiKeys);
  } catch {
    preferences = { ...defaultPreferences, aiModels: { ...defaultPreferences.aiModels } };
    encryptedApiKeys = {};
  }
}

function getKey() {
  const secret = process.env.REVIVAL_BIBLE_CONFIG_SECRET || 'revival-bible-v3-local-development';
  return scryptSync(secret, KEY_SALT, 32);
}

export function encryptValue(value) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString('base64'), tag.toString('base64'), encrypted.toString('base64')].join(':');
}

export function decryptValue(payload) {
  const [ivText, tagText, encryptedText] = String(payload).split(':');
  const decipher = createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedText, 'base64')),
    decipher.final()
  ]);

  return decrypted.toString('utf8');
}

export function hasApiKey(provider = 'default') {
  return Boolean(encryptedApiKeys[normalizeProvider(provider)]);
}

export function setApiKey({ provider = 'default', apiKey = '' } = {}) {
  const providerId = normalizeProvider(provider);
  const normalizedApiKey = normalizeApiKey(apiKey);

  if (!normalizedApiKey || isPlaceholderApiKey(normalizedApiKey)) {
    delete encryptedApiKeys[providerId];
    persistConfig();
    return { apiKeySaved: getApiKeySavedStatus(), saved: false, provider: providerId };
  }

  encryptedApiKeys[providerId] = encryptValue(normalizedApiKey);
  persistConfig();
  return { apiKeySaved: getApiKeySavedStatus(), saved: true, provider: providerId };
}

export function getPreferences() {
  return {
    ...preferences,
    aiModels: { ...preferences.aiModels },
    apiKeySaved: getApiKeySavedStatus()
  };
}

export function setPreferences(nextPreferences = {}) {
  preferences = normalizePreferences({
    ...preferences,
    ...nextPreferences,
    aiModels: {
      ...preferences.aiModels,
      ...(nextPreferences.aiModels || {})
    }
  });
  persistConfig();
  return getPreferences();
}

export async function testProviderConnection(provider = preferences.aiProvider) {
  const providerId = normalizeProvider(provider);
  const inFlight = connectionTestsInFlight.get(providerId);
  if (inFlight) return inFlight;

  const test = runProviderConnectionTest(providerId).finally(() => {
    connectionTestsInFlight.delete(providerId);
  });
  connectionTestsInFlight.set(providerId, test);
  return test;
}

async function runProviderConnectionTest(providerId) {
  const model = preferences.aiModels[providerId];
  const encryptedApiKey = encryptedApiKeys[providerId];

  if (!encryptedApiKey) {
    return failure(providerId, `Save a ${providerLabels[providerId]} API key before testing.`);
  }

  if (!model) {
    return failure(providerId, `Save a ${providerLabels[providerId]} model name before testing.`);
  }

  try {
    const apiKey = normalizeApiKey(decryptValue(encryptedApiKey));
    if (!apiKey || isPlaceholderApiKey(apiKey)) {
      return failure(providerId, `Save a valid ${providerLabels[providerId]} API key before testing.`);
    }

    if (providerId === 'openai' && !isOpenAiApiKey(apiKey)) {
      logOpenAiDiagnostic({
        apiKey,
        model,
        providerId,
        responseBody: 'Saved OpenAI API key failed local prefix validation before request.'
      });
      return failure(providerId, 'Saved OpenAI API key does not look like an OpenAI key. Expected a standard OpenAI secret-key prefix.');
    }

    return await (providerId === 'anthropic'
      ? testAnthropicConnection({ apiKey, model, providerId })
      : testOpenAiConnection({ apiKey, model, providerId }));
  } catch {
    return failure(providerId, 'Connection test could not be completed. Check the saved key, model name, and network connection.');
  }
}

function persistConfig() {
  if (!configFilePath) return;

  mkdirSync(dirname(configFilePath), { recursive: true });
  writeFileSync(configFilePath, JSON.stringify({ preferences, encryptedApiKeys }, null, 2));
}

function normalizePreferences(nextPreferences = {}) {
  const aiProvider = normalizeProvider(nextPreferences.aiProvider || defaultPreferences.aiProvider);

  return {
    theme: nextPreferences.theme || defaultPreferences.theme,
    aiProvider,
    aiModels: {
      anthropic: String(nextPreferences.aiModels?.anthropic || nextPreferences.aiModels?.claude || '').trim(),
      openai: String(nextPreferences.aiModels?.openai || '').trim()
    }
  };
}

function normalizeEncryptedApiKeys(keys = {}) {
  return Object.entries(keys || {}).reduce((normalized, [provider, encryptedValue]) => {
    const providerId = normalizeProvider(provider);
    if (encryptedValue) normalized[providerId] = encryptedValue;
    return normalized;
  }, {});
}

function normalizeProvider(provider = 'openai') {
  const value = String(provider || '').trim().toLowerCase();
  if (value === 'claude') return 'anthropic';
  if (value === 'anthropic' || value === 'openai') return value;
  return 'openai';
}

function getApiKeySavedStatus() {
  return Object.fromEntries(providerIds.map((provider) => [provider, Boolean(encryptedApiKeys[provider])]));
}

function normalizeApiKey(apiKey = '') {
  return String(apiKey).trim().replace(/\s+/g, '');
}

function isPlaceholderApiKey(apiKey = '') {
  const value = String(apiKey).trim().toLowerCase();
  return !value
    || value === 'enterapikey'
    || value.includes('savedlocally')
    || value.includes('enteranewkeytoreplace')
    || /^[•*]+$/.test(value);
}

function isOpenAiApiKey(apiKey = '') {
  return apiKey.startsWith('sk-');
}

async function testOpenAiConnection({ apiKey, model, providerId }) {
  const requestBody = {
    model,
    input: 'Reply with OK.',
    max_output_tokens: 16
  };

  logOpenAiDiagnostic({
    apiKey,
    model,
    providerId
  });

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const responseBody = await response.text();
  logOpenAiDiagnostic({
    apiKey,
    model,
    providerId,
    responseBody,
    statusCode: response.status
  });

  if (response.ok) {
    return {
      ok: true,
      provider: providerId,
      status: 'success',
      message: 'OpenAI connection succeeded.'
    };
  }

  return failure(providerId, getReadableProviderErrorFromText(response, responseBody));
}

async function testAnthropicConnection({ apiKey, model, providerId }) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      model,
      max_tokens: 8,
      messages: [
        { role: 'user', content: 'Reply with OK.' }
      ]
    })
  });

  return parseProviderResponse({ providerId, response, successMessage: 'Claude / Anthropic connection succeeded.' });
}

async function parseProviderResponse({ providerId, response, successMessage }) {
  if (response.ok) {
    return {
      ok: true,
      provider: providerId,
      status: 'success',
      message: successMessage
    };
  }

  return failure(providerId, await getReadableProviderError(response));
}

async function getReadableProviderError(response) {
  let details = '';

  try {
    const payload = await response.json();
    details = payload?.error?.message || payload?.message || '';
  } catch {
    details = response.statusText || '';
  }

  const message = sanitizeProviderMessage(details);
  return message
    ? `Connection failed (${response.status}): ${message}`
    : `Connection failed with HTTP ${response.status}.`;
}

function getReadableProviderErrorFromText(response, responseBody = '') {
  let details = '';

  try {
    const payload = JSON.parse(responseBody);
    details = payload?.error?.message || payload?.message || responseBody;
  } catch {
    details = responseBody || response.statusText || '';
  }

  const message = sanitizeProviderMessage(details);
  return message
    ? `Connection failed (${response.status}): ${message}`
    : `Connection failed with HTTP ${response.status}.`;
}

function failure(providerId, message) {
  return {
    ok: false,
    provider: providerId,
    status: 'failure',
    message: sanitizeProviderMessage(message)
  };
}

function sanitizeProviderMessage(message = '') {
  return String(message)
    .replace(/sk-[A-Za-z0-9_.*-]+/g, '[redacted]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [redacted]')
    .replace(/x-api-key[=:]\s*[A-Za-z0-9._-]+/gi, 'x-api-key=[redacted]')
    .trim();
}

function logOpenAiDiagnostic({ apiKey, model, providerId, responseBody, statusCode }) {
  if (process.env.NODE_ENV === 'production') return;

  const diagnostic = {
    provider: providerId,
    model,
    keyPrefixFamily: getApiKeyPrefixFamily(apiKey),
    keyLength: apiKey.length
  };

  if (statusCode) diagnostic.statusCode = statusCode;
  if (responseBody !== undefined) diagnostic.responseBody = sanitizeProviderMessage(responseBody);

  console.info(`[Revival Bible v3] OpenAI connection diagnostic: ${JSON.stringify(diagnostic)}`);
}

function getApiKeyPrefixFamily(apiKey = '') {
  if (apiKey.startsWith('sk-proj-')) return 'sk-proj';
  if (apiKey.startsWith('sk-')) return 'sk-...';
  return 'unrecognized';
}
