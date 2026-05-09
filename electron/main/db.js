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

export function getDecision(id) {
  return connection.prepare('SELECT * FROM decisions WHERE id = ?').get(id);
}

export function getDecisionBlockers(identifier) {
  const decision = connection
    .prepare('SELECT * FROM decisions WHERE id = ? OR sequence_number = ? LIMIT 1')
    .get(identifier, identifier);

  if (!decision) {
    return { decision: null, blockedBy: [], blocks: [] };
  }

  const parseList = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const blockedBySequenceNumbers = parseList(decision.blocked_by);
  const blockSequenceNumbers = parseList(decision.blocks);
  const findBySequenceNumbers = (sequenceNumbers) => {
    if (!sequenceNumbers.length) return [];
    const placeholders = sequenceNumbers.map(() => '?').join(', ');
    return connection
      .prepare(`SELECT * FROM decisions WHERE sequence_number IN (${placeholders}) ORDER BY tier, sequence_number`)
      .all(...sequenceNumbers);
  };

  return {
    decision,
    blockedBy: findBySequenceNumbers(blockedBySequenceNumbers),
    blocks: findBySequenceNumbers(blockSequenceNumbers)
  };
}

export function getQuestions() {
  return connection
    .prepare('SELECT * FROM questions ORDER BY urgency, id')
    .all();
}

export function getQuestion(id) {
  return connection.prepare('SELECT * FROM questions WHERE id = ?').get(id);
}

export function getLivingDocuments() {
  return connection
    .prepare('SELECT * FROM living_documents ORDER BY doc_type, entry_number, id')
    .all();
}

export function getLivingDocumentsByType(docType) {
  return connection
    .prepare('SELECT * FROM living_documents WHERE doc_type = ? ORDER BY entry_number, id')
    .all(docType);
}

export function getLivingDocumentEntry(id) {
  return connection.prepare('SELECT * FROM living_documents WHERE id = ?').get(id);
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

export function seedDecisionsIfNeeded(decisions) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM decisions').get().count;
  const findBySequenceNumber = connection.prepare('SELECT id FROM decisions WHERE sequence_number = ?');

  if (existingCount >= decisions.length) {
    return { seeded: false, decisions: existingCount, expected: decisions.length };
  }

  const insertDecision = connection.prepare(`
    INSERT INTO decisions (
      tier, sequence_number, title, question, why_first, what_we_know,
      what_needs_deciding, answer, status, blocks, blocked_by, locked_at
    )
    VALUES (
      @tier, @sequence_number, @title, @question, @why_first, @what_we_know,
      @what_needs_deciding, @answer, @status, @blocks, @blocked_by, @locked_at
    )
  `);

  const transaction = connection.transaction(() => {
    for (const decision of decisions) {
      if (!findBySequenceNumber.get(decision.sequence_number)) {
        insertDecision.run(decision);
      }
    }
  });

  transaction();

  const finalCount = connection.prepare('SELECT COUNT(*) AS count FROM decisions').get().count;
  return {
    seeded: finalCount > existingCount,
    decisions: finalCount,
    expected: decisions.length,
    partialBeforeSeed: existingCount > 0 && existingCount < decisions.length
  };
}

export function seedQuestionsIfNeeded(questions) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM questions').get().count;
  const findByQuestion = connection.prepare('SELECT id FROM questions WHERE question = ?');

  if (existingCount >= questions.length) {
    return { seeded: false, questions: existingCount, expected: questions.length };
  }

  const insertQuestion = connection.prepare(`
    INSERT INTO questions (question, urgency, status, answer, context, blocks, blocked_by)
    VALUES (@question, @urgency, @status, @answer, @context, @blocks, @blocked_by)
  `);

  const transaction = connection.transaction(() => {
    for (const question of questions) {
      if (!findByQuestion.get(question.question)) {
        insertQuestion.run(question);
      }
    }
  });

  transaction();

  const finalCount = connection.prepare('SELECT COUNT(*) AS count FROM questions').get().count;
  return {
    seeded: finalCount > existingCount,
    questions: finalCount,
    expected: questions.length,
    partialBeforeSeed: existingCount > 0 && existingCount < questions.length
  };
}

export function seedLivingDocumentsIfNeeded(livingDocuments) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM living_documents').get().count;
  const findByTypeAndEntry = connection.prepare('SELECT id FROM living_documents WHERE doc_type = ? AND entry_number = ?');
  const insertLivingDocument = connection.prepare(`
    INSERT INTO living_documents (doc_type, entry_number, fields, status)
    VALUES (@doc_type, @entry_number, @fields, @status)
  `);

  const transaction = connection.transaction(() => {
    for (const document of livingDocuments) {
      if (!findByTypeAndEntry.get(document.doc_type, document.entry_number)) {
        insertLivingDocument.run(document);
      }
    }
  });

  transaction();

  const finalRows = connection
    .prepare('SELECT doc_type, COUNT(*) AS count FROM living_documents GROUP BY doc_type ORDER BY doc_type')
    .all();

  return {
    seeded: finalRows.reduce((total, row) => total + row.count, 0) > existingCount,
    livingDocuments: finalRows,
    expectedTypes: [...new Set(livingDocuments.map((document) => document.doc_type))].length
  };
}
