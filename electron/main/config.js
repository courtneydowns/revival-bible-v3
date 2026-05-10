import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const ALGORITHM = 'aes-256-gcm';
const KEY_SALT = 'revival-bible-v3-config';
const providerIds = ['anthropic', 'openai'];
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

  if (!apiKey.trim()) {
    delete encryptedApiKeys[providerId];
    persistConfig();
    return { apiKeySaved: getApiKeySavedStatus(), saved: false, provider: providerId };
  }

  encryptedApiKeys[providerId] = encryptValue(apiKey.trim());
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
