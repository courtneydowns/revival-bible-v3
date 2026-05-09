import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_SALT = 'revival-bible-v3-config';
const preferences = {
  theme: 'dark',
  aiProvider: 'none'
};
let encryptedApiKeys = {};

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
  return Boolean(encryptedApiKeys[provider]);
}

export function setApiKey({ provider = 'default', apiKey = '' } = {}) {
  if (!apiKey.trim()) {
    delete encryptedApiKeys[provider];
    return { saved: false, provider };
  }

  encryptedApiKeys[provider] = encryptValue(apiKey.trim());
  return { saved: true, provider };
}

export function getPreferences() {
  return { ...preferences };
}

export function setPreferences(nextPreferences = {}) {
  Object.assign(preferences, nextPreferences);
  return { ...preferences };
}
