import Database from 'better-sqlite3';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { initializeSchema } from './schema.js';

let connection;
let databasePath;

export function initDatabase(app) {
  const dataDir = app.isPackaged
    ? app.getPath('userData')
    : join(process.cwd(), '.data');

  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  databasePath = join(dataDir, 'revival-bible-v3.sqlite');
  connection = new Database(databasePath);
  initializeSchema(connection);

  console.info(`[Revival Bible v3] SQLite database: ${databasePath}`);
  return { path: databasePath, connected: true };
}

export function getDatabaseInfo() {
  return {
    path: databasePath,
    connected: Boolean(connection)
  };
}

export function closeDatabase() {
  if (connection) {
    connection.close();
    connection = undefined;
  }
}

export function getNodeTree() {
  return connection
    .prepare('SELECT * FROM nodes ORDER BY COALESCE(parent_id, ""), position, title')
    .all();
}

export function getEpisodes() {
  return connection
    .prepare('SELECT * FROM episodes ORDER BY season, episode_number')
    .all();
}

export function getCharacters() {
  return connection
    .prepare('SELECT * FROM characters ORDER BY COALESCE(position, id), name')
    .all();
}

export function getDecisions() {
  return connection
    .prepare('SELECT * FROM decisions ORDER BY tier, sequence_number')
    .all();
}

export function getQuestions() {
  return connection
    .prepare('SELECT * FROM questions ORDER BY urgency, id')
    .all();
}

export function getLivingDocuments() {
  return connection
    .prepare('SELECT * FROM living_documents ORDER BY doc_type, entry_number, id')
    .all();
}

export function querySearchIndex(query) {
  const term = String(query || '').trim();
  if (!term) return [];

  return connection
    .prepare(`
      SELECT entity_type, entity_id, title, content, section_path
      FROM search_index
      WHERE search_index MATCH ?
      LIMIT 25
    `)
    .all(term);
}

export function clearSearchIndex() {
  connection.prepare('DELETE FROM search_index').run();
  return { rebuilt: true, indexed: 0 };
}
