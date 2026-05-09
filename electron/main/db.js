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

export function seedCharacterRelationshipsIfNeeded(relationships) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM character_relationships').get().count;
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

  const finalRows = connection
    .prepare('SELECT relationship_type, COUNT(*) AS count FROM character_relationships GROUP BY relationship_type ORDER BY relationship_type')
    .all();

  return {
    seeded: finalRows.reduce((total, row) => total + row.count, 0) > existingCount,
    relationships: finalRows,
    expectedNew: relationships.length
  };
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

export function getTimelineEvents() {
  return connection
    .prepare(`
      SELECT *
      FROM timeline_events
      ORDER BY position, COALESCE(season, 0), COALESCE(episode_number, 0), id
    `)
    .all();
}

export function getTimelineEvent(id) {
  return connection.prepare('SELECT * FROM timeline_events WHERE id = ?').get(id);
}

export function querySearchIndex(query) {
  const term = String(query || '').trim();
  if (!term) return [];
  const ftsQuery = buildSearchQuery(term);
  if (!ftsQuery) return [];

  return connection
    .prepare(`
      SELECT
        entity_type,
        entity_id,
        title,
        snippet(search_index, 3, '<mark>', '</mark>', '...', 24) AS snippet,
        section_path
      FROM search_index
      WHERE search_index MATCH ?
      ORDER BY bm25(search_index)
      LIMIT 25
    `)
    .all(ftsQuery);
}

export function clearSearchIndex() {
  connection.prepare('DELETE FROM search_index').run();
  return { rebuilt: true, indexed: 0 };
}

export function ensureSearchIndex() {
  const indexed = connection.prepare('SELECT COUNT(*) AS count FROM search_index').get().count;
  const expected = getSearchSourceCount();

  if (indexed === expected && indexed > 0) {
    return { rebuilt: false, indexed, expected };
  }

  return {
    ...rebuildSearchIndex(),
    expected
  };
}

export function rebuildSearchIndex() {
  const insertSearchRow = connection.prepare(`
    INSERT INTO search_index (entity_type, entity_id, title, content, section_path)
    VALUES (@entity_type, @entity_id, @title, @content, @section_path)
  `);
  const parentTitles = new Map(
    connection
      .prepare('SELECT id, title FROM nodes')
      .all()
      .map((node) => [node.id, node.title])
  );
  const rows = [];

  for (const node of connection.prepare(`
    SELECT n.*, nc.content
    FROM nodes n
    LEFT JOIN node_content nc ON nc.node_id = n.id
      AND nc.version = (
        SELECT MAX(version)
        FROM node_content latest
        WHERE latest.node_id = n.id
      )
    ORDER BY COALESCE(n.parent_id, ''), n.position, n.title
  `).all()) {
    rows.push({
      entity_type: 'bible_section',
      entity_id: node.id,
      title: node.title,
      content: compactText([node.title, node.node_type, node.status, node.metadata, node.content]),
      section_path: node.parent_id ? `${parentTitles.get(node.parent_id) || 'Story Bible'} / ${node.title}` : node.title
    });
  }

  for (const character of getCharacters()) {
    rows.push({
      entity_type: 'character',
      entity_id: String(character.id),
      title: character.name,
      content: compactText([
        character.name,
        character.role,
        character.status_at_open,
        character.arc_season_1,
        character.arc_season_2,
        character.arc_season_3,
        character.what_they_carry,
        character.what_they_wont,
        character.voice_notes,
        character.end_state,
        character.notes
      ]),
      section_path: character.role || 'Character'
    });
  }

  for (const episode of getEpisodes()) {
    rows.push({
      entity_type: 'episode',
      entity_id: String(episode.id),
      title: episode.title || `S${episode.season}E${episode.episode_number}`,
      content: compactText([
        episode.title,
        episode.na_tradition,
        episode.dual_meaning,
        episode.arc_summary,
        episode.thematic_core,
        episode.cold_open,
        flattenJsonText(episode.acts),
        episode.flanagan_moment,
        episode.rewatch_notes,
        episode.status
      ]),
      section_path: `Season ${episode.season} / Episode ${episode.episode_number}`
    });
  }

  for (const decision of getDecisions()) {
    rows.push({
      entity_type: 'decision',
      entity_id: String(decision.id),
      title: decision.title,
      content: compactText([
        decision.title,
        decision.question,
        decision.why_first,
        decision.what_we_know,
        decision.what_needs_deciding,
        decision.answer,
        decision.status,
        decision.blocks,
        decision.blocked_by
      ]),
      section_path: `Tier ${decision.tier} / Decision #${decision.sequence_number}`
    });
  }

  for (const question of getQuestions()) {
    rows.push({
      entity_type: 'question',
      entity_id: String(question.id),
      title: question.question,
      content: compactText([
        question.question,
        question.urgency,
        question.status,
        question.answer,
        question.context,
        question.blocks,
        question.blocked_by
      ]),
      section_path: formatUrgency(question.urgency)
    });
  }

  for (const document of getLivingDocuments()) {
    const fields = parseJsonObject(document.fields);
    rows.push({
      entity_type: 'living_document',
      entity_id: String(document.id),
      title: `${formatDocType(document.doc_type)} Entry ${document.entry_number || document.id}`,
      content: compactText([formatDocType(document.doc_type), document.status, flattenJsonText(fields)]),
      section_path: formatDocType(document.doc_type)
    });
  }

  for (const event of getTimelineEvents()) {
    rows.push({
      entity_type: 'timeline_event',
      entity_id: String(event.id),
      title: event.title,
      content: compactText([
        event.title,
        event.summary,
        event.chronology_bucket,
        event.outbreak_phase,
        event.event_type,
        event.source_note,
        event.status
      ]),
      section_path: formatTimelineLocation(event)
    });
  }

  const transaction = connection.transaction(() => {
    connection.prepare('DELETE FROM search_index').run();
    for (const row of rows) {
      insertSearchRow.run(row);
    }
  });

  transaction();

  const counts = connection
    .prepare('SELECT entity_type, COUNT(*) AS count FROM search_index GROUP BY entity_type ORDER BY entity_type')
    .all();

  return {
    rebuilt: true,
    indexed: rows.length,
    counts
  };
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

export function seedTimelineEventsIfNeeded(timelineEvents) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM timeline_events').get().count;
  const findBySeedKey = connection.prepare('SELECT id FROM timeline_events WHERE seed_key = ?');
  const insertTimelineEvent = connection.prepare(`
    INSERT INTO timeline_events (
      seed_key, season, episode_number, chronology_bucket, outbreak_phase,
      event_type, title, summary, source_note, position, status
    )
    VALUES (
      @seed_key, @season, @episode_number, @chronology_bucket, @outbreak_phase,
      @event_type, @title, @summary, @source_note, @position, @status
    )
  `);

  const transaction = connection.transaction(() => {
    for (const event of timelineEvents) {
      if (!findBySeedKey.get(event.seed_key)) {
        insertTimelineEvent.run(event);
      }
    }
  });

  transaction();

  const finalRows = connection
    .prepare('SELECT chronology_bucket, COUNT(*) AS count FROM timeline_events GROUP BY chronology_bucket ORDER BY MIN(position)')
    .all();

  return {
    seeded: finalRows.reduce((total, row) => total + row.count, 0) > existingCount,
    timelineEvents: finalRows,
    expected: timelineEvents.length
  };
}

function buildSearchQuery(term) {
  return term
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}_]/gu, ''))
    .filter(Boolean)
    .slice(0, 8)
    .map((part) => `${part}*`)
    .join(' AND ');
}

function getSearchSourceCount() {
  return [
    'nodes',
    'characters',
    'episodes',
    'decisions',
    'questions',
    'living_documents',
    'timeline_events'
  ].reduce((total, tableName) => total + connection.prepare(`SELECT COUNT(*) AS count FROM ${tableName}`).get().count, 0);
}

function compactText(parts) {
  return parts
    .flatMap((part) => {
      if (Array.isArray(part)) return part;
      return [part];
    })
    .filter((part) => part !== undefined && part !== null && String(part).trim())
    .map((part) => String(part).replace(/\s+/g, ' ').trim())
    .join('\n');
}

function flattenJsonText(value) {
  if (!value) return '';
  const parsed = typeof value === 'string' ? parseJsonValue(value) : value;

  if (Array.isArray(parsed)) {
    return parsed.map((item) => flattenJsonText(item)).join('\n');
  }

  if (parsed && typeof parsed === 'object') {
    return Object.entries(parsed)
      .map(([key, entryValue]) => `${formatLabel(key)}: ${flattenJsonText(entryValue)}`)
      .join('\n');
  }

  return String(parsed);
}

function parseJsonValue(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function parseJsonObject(value) {
  const parsed = parseJsonValue(value);
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
}

function formatDocType(docType) {
  const labels = {
    rewatch_ledger: 'Rewatch Ledger',
    dread_map: 'Dread Map',
    obligation_ledger: 'Obligation Ledger',
    caroline_map: 'Caroline Logic Map'
  };

  return labels[docType] || formatLabel(docType);
}

function formatUrgency(urgency) {
  const labels = {
    pinned: 'Pinned',
    tier1: 'Tier 1 - Blocks Pilot',
    tier2: 'Tier 2 - Blocks Season Overview',
    tier3: "Tier 3 - Blocks Writers' Room"
  };

  return labels[urgency] || formatLabel(urgency);
}

function formatTimelineLocation(event) {
  const episodeLabel = event.season && event.episode_number ? `S${event.season}E${event.episode_number}` : null;
  return [event.chronology_bucket, episodeLabel, event.outbreak_phase].filter(Boolean).join(' / ');
}

function formatLabel(value) {
  return String(value || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
