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
    .prepare("SELECT * FROM nodes ORDER BY COALESCE(parent_id, ''), position, title")
    .all();
}

export function getNode(id) {
  return connection.prepare('SELECT * FROM nodes WHERE id = ?').get(id);
}

export function getLatestNodeContent(nodeId) {
  return connection
    .prepare(`
      SELECT *
      FROM node_content
      WHERE node_id = ?
      ORDER BY version DESC, created_at DESC
      LIMIT 1
    `)
    .get(nodeId);
}

export function getEpisodes() {
  return connection
    .prepare('SELECT * FROM episodes ORDER BY season, episode_number')
    .all();
}

export function getEpisodesBySeason(season) {
  return connection
    .prepare('SELECT * FROM episodes WHERE season = ? ORDER BY episode_number')
    .all(season);
}

export function getEpisode(id) {
  return connection.prepare('SELECT * FROM episodes WHERE id = ?').get(id);
}

export function updateEpisode(id, data = {}) {
  return {
    id,
    updated: false,
    data,
    message: 'Episode editing is not implemented in Phase 3A.'
  };
}

export function getCharacters() {
  return connection
    .prepare('SELECT * FROM characters ORDER BY COALESCE(position, id), name')
    .all();
}

export function getCharacter(id) {
  return connection.prepare('SELECT * FROM characters WHERE id = ?').get(id);
}

export function getCharacterRelationships(characterId) {
  return connection
    .prepare(`
      SELECT
        cr.*,
        a.name AS character_a_name,
        b.name AS character_b_name
      FROM character_relationships cr
      JOIN characters a ON a.id = cr.character_a_id
      JOIN characters b ON b.id = cr.character_b_id
      WHERE cr.character_a_id = ? OR cr.character_b_id = ?
      ORDER BY cr.relationship_type, a.name, b.name
    `)
    .all(characterId, characterId);
}

export function getCharacterRelationshipCount() {
  return connection.prepare('SELECT COUNT(*) AS count FROM character_relationships').get().count;
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

export function seedBibleIfEmpty({ nodes, contents, characters, relationships }) {
  const nodeCount = connection.prepare('SELECT COUNT(*) AS count FROM nodes').get().count;
  const characterCount = connection.prepare('SELECT COUNT(*) AS count FROM characters').get().count;

  const insertNode = connection.prepare(`
    INSERT INTO nodes (id, parent_id, title, node_type, position, status, metadata)
    VALUES (@id, @parent_id, @title, @node_type, @position, @status, @metadata)
    ON CONFLICT(id) DO UPDATE SET
      parent_id = excluded.parent_id,
      title = excluded.title,
      node_type = excluded.node_type,
      position = excluded.position,
      status = excluded.status,
      metadata = excluded.metadata
  `);

  const insertContent = connection.prepare(`
    INSERT INTO node_content (id, node_id, content, version, session_origin)
    VALUES (@id, @node_id, @content, @version, @session_origin)
    ON CONFLICT(id) DO UPDATE SET
      content = excluded.content,
      version = excluded.version,
      session_origin = excluded.session_origin
  `);

  const insertCharacter = connection.prepare(`
    INSERT INTO characters (name, role, status_at_open, position)
    VALUES (@name, @role, @status_at_open, @position)
  `);

  const updateCharacter = connection.prepare(`
    UPDATE characters
    SET role = @role,
        status_at_open = @status_at_open,
        position = @position
    WHERE name = @name
  `);

  const getCharacterByName = connection.prepare('SELECT id FROM characters WHERE name = ?');
  const findRelationship = connection.prepare(`
    SELECT id
    FROM character_relationships
    WHERE character_a_id = ?
      AND character_b_id = ?
      AND relationship_type = ?
      AND detail = ?
  `);

  const insertRelationship = connection.prepare(`
    INSERT INTO character_relationships (character_a_id, character_b_id, relationship_type, detail)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = connection.transaction(() => {
    for (const node of nodes) {
      insertNode.run(node);
    }

    for (const content of contents) {
      insertContent.run(content);
    }

    for (const character of characters) {
      if (!getCharacterByName.get(character.name)) {
        insertCharacter.run(character);
      }
      updateCharacter.run(character);
    }

    for (const relationship of relationships) {
      const from = getCharacterByName.get(relationship.from);
      const to = getCharacterByName.get(relationship.to);

      if (!from || !to) continue;

      const exists = findRelationship.get(from.id, to.id, relationship.relationship_type, relationship.detail);
      if (!exists) {
        insertRelationship.run(from.id, to.id, relationship.relationship_type, relationship.detail);
      }
    }
  });

  transaction();

  return {
    seeded: nodeCount === 0 || characterCount === 0,
    nodes: nodes.length,
    characters: characters.length,
    relationships: relationships.length
  };
}

export function seedEpisodesIfNeeded(episodes) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM episodes').get().count;
  const existingBySlot = connection.prepare('SELECT id FROM episodes WHERE season = ? AND episode_number = ?');

  if (existingCount === episodes.length) {
    return { seeded: false, episodes: existingCount, expected: episodes.length };
  }

  const insertWithId = connection.prepare(`
    INSERT INTO episodes (
      id, season, episode_number, title, na_tradition, dual_meaning, arc_summary,
      thematic_core, cold_open, acts, flanagan_moment, rewatch_notes, status
    )
    VALUES (
      @id, @season, @episode_number, @title, @na_tradition, @dual_meaning, @arc_summary,
      @thematic_core, @cold_open, @acts, @flanagan_moment, @rewatch_notes, @status
    )
  `);

  const insertWithoutId = connection.prepare(`
    INSERT INTO episodes (
      season, episode_number, title, na_tradition, dual_meaning, arc_summary,
      thematic_core, cold_open, acts, flanagan_moment, rewatch_notes, status
    )
    VALUES (
      @season, @episode_number, @title, @na_tradition, @dual_meaning, @arc_summary,
      @thematic_core, @cold_open, @acts, @flanagan_moment, @rewatch_notes, @status
    )
  `);

  const updateExisting = connection.prepare(`
    UPDATE episodes
    SET title = @title,
        na_tradition = @na_tradition,
        dual_meaning = @dual_meaning,
        arc_summary = @arc_summary,
        thematic_core = @thematic_core,
        cold_open = @cold_open,
        acts = @acts,
        flanagan_moment = @flanagan_moment,
        rewatch_notes = @rewatch_notes,
        status = @status
    WHERE season = @season AND episode_number = @episode_number
  `);

  const transaction = connection.transaction(() => {
    for (const episode of episodes) {
      const existing = existingBySlot.get(episode.season, episode.episode_number);

      if (existing) {
        updateExisting.run(episode);
        continue;
      }

      try {
        insertWithId.run(episode);
      } catch {
        insertWithoutId.run(episode);
      }
    }
  });

  transaction();

  const finalCount = connection.prepare('SELECT COUNT(*) AS count FROM episodes').get().count;
  return {
    seeded: existingCount === 0,
    episodes: finalCount,
    expected: episodes.length,
    partialBeforeSeed: existingCount > 0 && existingCount < episodes.length
  };
}
