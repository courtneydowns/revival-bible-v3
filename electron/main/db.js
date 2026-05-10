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

export function getCanonTags() {
  return connection.prepare('SELECT * FROM canon_tags ORDER BY label').all();
}

export function addEntityTag(entityType, entityId, tagValue) {
  const tag = ensureCanonTag(tagValue);
  if (!tag) {
    return { ok: false, message: 'Tag is required.' };
  }

  validateEntityReference(entityType, entityId);

  connection
    .prepare(`
      INSERT INTO entity_tag_links (tag_id, entity_type, entity_id)
      VALUES (?, ?, ?)
      ON CONFLICT(tag_id, entity_type, entity_id) DO NOTHING
    `)
    .run(tag.id, entityType, String(entityId));

  return {
    ok: true,
    tag,
    tags: getEntityTags(entityType, entityId),
    search: rebuildSearchIndex()
  };
}

export function removeEntityTag(entityType, entityId, tagSlug) {
  const slug = normalizeTagSlug(tagSlug);
  if (!slug) {
    return { ok: false, message: 'Tag slug is required.' };
  }

  validateEntityReference(entityType, entityId);

  connection
    .prepare(`
      DELETE FROM entity_tag_links
      WHERE entity_type = ?
        AND entity_id = ?
        AND tag_id = (SELECT id FROM canon_tags WHERE slug = ?)
    `)
    .run(entityType, String(entityId), slug);

  return {
    ok: true,
    tags: getEntityTags(entityType, entityId),
    search: rebuildSearchIndex()
  };
}

export function getEntityTagLinks() {
  return connection
    .prepare(`
      SELECT
        etl.entity_type,
        etl.entity_id,
        etl.note,
        ct.slug,
        ct.label,
        ct.description,
        ct.color
      FROM entity_tag_links etl
      JOIN canon_tags ct ON ct.id = etl.tag_id
      ORDER BY etl.entity_type, etl.entity_id, ct.label
    `)
    .all();
}

export function getEntityLinks(entityType, entityId) {
  validateEntityReference(entityType, entityId);

  const rows = connection
    .prepare(`
      SELECT *
      FROM entity_links
      WHERE (source_type = ? AND source_id = ?)
        OR (target_type = ? AND target_id = ?)
      ORDER BY relationship_type, id
    `)
    .all(entityType, String(entityId), entityType, String(entityId));

  return rows.map((link) => hydrateEntityLink(link, entityType, entityId));
}

export function getAllEntityLinks() {
  return connection
    .prepare('SELECT * FROM entity_links ORDER BY source_type, source_id, relationship_type, target_type, target_id')
    .all()
    .map((link) => hydrateEntityLink(link));
}

export function getContextPacks() {
  const packs = connection.prepare('SELECT * FROM context_packs ORDER BY updated_at DESC, id DESC').all();
  return packs.map((pack) => ({
    ...pack,
    links: getContextPackLinks(pack.id)
  }));
}

export function createContextPack({ title = '', purpose = '' } = {}) {
  const normalizedTitle = normalizeContextPackTitle(title);
  if (!normalizedTitle) {
    return { ok: false, message: 'Context pack title is required.' };
  }

  const result = connection
    .prepare('INSERT INTO context_packs (title, purpose) VALUES (?, ?)')
    .run(normalizedTitle, String(purpose || '').trim());

  return {
    ok: true,
    pack: getContextPack(result.lastInsertRowid)
  };
}

export function updateContextPack(id, { title = '', purpose = '' } = {}) {
  const normalizedTitle = normalizeContextPackTitle(title);
  if (!normalizedTitle) {
    return { ok: false, message: 'Context pack title is required.' };
  }

  const result = connection
    .prepare('UPDATE context_packs SET title = ?, purpose = ? WHERE id = ?')
    .run(normalizedTitle, String(purpose || '').trim(), id);

  if (!result.changes) {
    return { ok: false, message: 'Context pack not found.' };
  }

  return {
    ok: true,
    pack: getContextPack(id)
  };
}

export function deleteContextPack(id) {
  const result = connection.prepare('DELETE FROM context_packs WHERE id = ?').run(id);
  return {
    ok: result.changes > 0,
    message: result.changes ? undefined : 'Context pack not found.'
  };
}

export function addContextPackLink({ packId, entityType, entityId } = {}) {
  const pack = getContextPack(packId);
  if (!pack) {
    return { ok: false, message: 'Context pack not found.' };
  }

  const normalizedType = normalizeEntityType(entityType);
  validateEntityReference(normalizedType, entityId);

  connection
    .prepare(`
      INSERT INTO context_pack_links (pack_id, entity_type, entity_id)
      VALUES (?, ?, ?)
      ON CONFLICT(pack_id, entity_type, entity_id) DO NOTHING
    `)
    .run(packId, normalizedType, String(entityId));

  return {
    ok: true,
    pack: getContextPack(packId)
  };
}

export function removeContextPackLink(linkId) {
  const existing = connection.prepare('SELECT * FROM context_pack_links WHERE id = ?').get(linkId);
  if (!existing) {
    return { ok: false, message: 'Context pack link not found.' };
  }

  connection.prepare('DELETE FROM context_pack_links WHERE id = ?').run(linkId);

  return {
    ok: true,
    pack: getContextPack(existing.pack_id)
  };
}

export function addEntityLink({ sourceType, sourceId, targetType, targetId, relationshipType = 'related', note = '' } = {}) {
  const normalized = normalizeEntityLinkInput({ sourceType, sourceId, targetType, targetId, relationshipType, note });
  validateEntityReference(normalized.source_type, normalized.source_id);
  validateEntityReference(normalized.target_type, normalized.target_id);

  if (normalized.source_type === normalized.target_type && normalized.source_id === normalized.target_id) {
    return { ok: false, message: 'A record cannot link to itself.' };
  }

  connection
    .prepare(`
      INSERT INTO entity_links (source_type, source_id, target_type, target_id, relationship_type, note)
      VALUES (@source_type, @source_id, @target_type, @target_id, @relationship_type, @note)
      ON CONFLICT(source_type, source_id, target_type, target_id, relationship_type)
      DO UPDATE SET note = excluded.note
    `)
    .run(normalized);

  return {
    ok: true,
    links: getEntityLinks(normalized.source_type, normalized.source_id),
    search: rebuildSearchIndex()
  };
}

export function removeEntityLink(linkId) {
  const existing = connection.prepare('SELECT * FROM entity_links WHERE id = ?').get(linkId);
  if (!existing) {
    return { ok: false, message: 'Link not found.' };
  }

  connection.prepare('DELETE FROM entity_links WHERE id = ?').run(linkId);

  return {
    ok: true,
    links: getEntityLinks(existing.source_type, existing.source_id),
    search: rebuildSearchIndex()
  };
}

export function updateEntityStatus(entityType, entityId, status) {
  const nextStatus = normalizeStatusValue(status);
  if (!nextStatus) {
    return { ok: false, message: 'Status is required.' };
  }

  const statusTargets = {
    character: { table: 'characters', column: 'canon_state' },
    decision: { table: 'decisions', column: 'status' },
    question: { table: 'questions', column: 'status' },
    timeline_event: { table: 'timeline_events', column: 'status' },
    living_document: { table: 'living_documents', column: 'status' }
  };
  const target = statusTargets[entityType];

  if (!target) {
    return { ok: false, message: `Status editing is not supported for ${entityType}.` };
  }

  const result = connection
    .prepare(`UPDATE ${target.table} SET ${target.column} = ? WHERE id = ?`)
    .run(nextStatus, entityId);

  if (!result.changes) {
    return { ok: false, message: 'Record not found.' };
  }

  return {
    ok: true,
    record: getEntityRecord(entityType, entityId),
    search: rebuildSearchIndex()
  };
}

export function querySearchIndex(query) {
  const term = String(query || '').trim();
  if (!term) return [];
  const ftsQuery = buildSearchQuery(term);
  if (!ftsQuery) return [];
  const tagLookup = getTagLookup();
  const statusLookup = getSearchStatusLookup();

  const rows = connection
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

  return rows.map((row) => {
    const tags = tagLookup.get(`${row.entity_type}:${row.entity_id}`) || [];
    const matchedTags = getMatchedTags(tags, term);
    const statuses = statusLookup.get(`${row.entity_type}:${row.entity_id}`) || [];
    const matchedStatuses = getMatchedStatuses(statuses, term);
    return {
      ...row,
      tags,
      matched_tags: matchedTags,
      matched_by_tag: matchedTags.length > 0,
      matched_statuses: matchedStatuses,
      matched_by_status: matchedStatuses.length > 0
    };
  });
}

export function clearSearchIndex() {
  connection.prepare('DELETE FROM search_index').run();
  return { rebuilt: true, indexed: 0 };
}

export function ensureSearchIndex() {
  const indexed = connection.prepare('SELECT COUNT(*) AS count FROM search_index').get().count;
  const expected = getSearchSourceCount();

  if (indexed === expected && indexed > 0 && searchIndexHasCanonTagContent() && searchIndexHasEntityLinkContent()) {
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
  const tagLookup = getTagLookup();
  const linkLookup = getEntityLinkSearchLookup();

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
        character.canon_state,
        character.status_at_open,
        character.arc_season_1,
        character.arc_season_2,
        character.arc_season_3,
        character.what_they_carry,
        character.what_they_wont,
        character.voice_notes,
        character.end_state,
        character.notes,
        formatLinksForSearch(linkLookup, 'character', character.id),
        formatTagsForSearch(tagLookup, 'character', character.id)
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
        episode.status,
        formatLinksForSearch(linkLookup, 'episode', episode.id),
        formatTagsForSearch(tagLookup, 'episode', episode.id)
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
        decision.blocked_by,
        formatLinksForSearch(linkLookup, 'decision', decision.id),
        formatTagsForSearch(tagLookup, 'decision', decision.id)
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
        question.blocked_by,
        formatLinksForSearch(linkLookup, 'question', question.id),
        formatTagsForSearch(tagLookup, 'question', question.id)
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
      content: compactText([
        formatDocType(document.doc_type),
        document.status,
        flattenJsonText(fields),
        formatLinksForSearch(linkLookup, 'living_document', document.id),
        formatTagsForSearch(tagLookup, 'living_document', document.id)
      ]),
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
        event.status,
        formatLinksForSearch(linkLookup, 'timeline_event', event.id),
        formatTagsForSearch(tagLookup, 'timeline_event', event.id)
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
  connection
    .prepare(`
      INSERT INTO config (key, value)
      VALUES ('search_index_entity_links', '1')
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `)
    .run();

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

export function seedCanonTagsIfNeeded({ tags, links }) {
  const existingTagCount = connection.prepare('SELECT COUNT(*) AS count FROM canon_tags').get().count;
  const existingLinkCount = connection.prepare('SELECT COUNT(*) AS count FROM entity_tag_links').get().count;
  const findTag = connection.prepare('SELECT id FROM canon_tags WHERE slug = ?');
  const insertTag = connection.prepare(`
    INSERT INTO canon_tags (slug, label, description, color)
    VALUES (@slug, @label, @description, @color)
  `);
  const insertLink = connection.prepare(`
    INSERT INTO entity_tag_links (tag_id, entity_type, entity_id, note)
    VALUES (@tag_id, @entity_type, @entity_id, @note)
    ON CONFLICT(tag_id, entity_type, entity_id) DO NOTHING
  `);

  const transaction = connection.transaction(() => {
    for (const tag of tags) {
      if (!findTag.get(tag.slug)) {
        insertTag.run(tag);
      }
    }

    for (const link of links) {
      const tag = findTag.get(link.tag);
      const entityId = resolveTagEntityId(link);

      if (!tag || !entityId) continue;

      insertLink.run({
        tag_id: tag.id,
        entity_type: link.entity_type,
        entity_id: String(entityId),
        note: link.note || null
      });
    }
  });

  transaction();

  const tagCount = connection.prepare('SELECT COUNT(*) AS count FROM canon_tags').get().count;
  const linkCount = connection.prepare('SELECT COUNT(*) AS count FROM entity_tag_links').get().count;

  return {
    seeded: tagCount > existingTagCount || linkCount > existingLinkCount,
    tags: tagCount,
    links: linkCount,
    expectedTags: tags.length,
    expectedLinks: links.length
  };
}

export function seedEntityLinksIfNeeded(links) {
  const existingCount = connection.prepare('SELECT COUNT(*) AS count FROM entity_links').get().count;
  const insertLink = connection.prepare(`
    INSERT INTO entity_links (source_type, source_id, target_type, target_id, relationship_type, note)
    VALUES (@source_type, @source_id, @target_type, @target_id, @relationship_type, @note)
    ON CONFLICT(source_type, source_id, target_type, target_id, relationship_type) DO NOTHING
  `);

  const transaction = connection.transaction(() => {
    for (const link of links) {
      const sourceId = resolveEntityId(link.source_type, link.source);
      const targetId = resolveEntityId(link.target_type, link.target);

      if (!sourceId || !targetId) continue;
      if (!getEntityRecord(link.source_type, sourceId) || !getEntityRecord(link.target_type, targetId)) continue;
      if (link.source_type === link.target_type && String(sourceId) === String(targetId)) continue;

      insertLink.run({
        source_type: link.source_type,
        source_id: String(sourceId),
        target_type: link.target_type,
        target_id: String(targetId),
        relationship_type: normalizeRelationshipType(link.relationship_type),
        note: link.note || null
      });
    }
  });

  transaction();

  const finalCount = connection.prepare('SELECT COUNT(*) AS count FROM entity_links').get().count;
  return {
    seeded: finalCount > existingCount,
    links: finalCount,
    expectedLinks: links.length
  };
}

function buildSearchQuery(term) {
  return term
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}_]/gu, ''))
    .filter(Boolean)
    .slice(0, 8)
    .map((part) => `${part}*`)
    .join(' AND ');
}

function getTagLookup() {
  const lookup = new Map();

  for (const tag of getEntityTagLinks()) {
    const key = `${tag.entity_type}:${tag.entity_id}`;
    if (!lookup.has(key)) {
      lookup.set(key, []);
    }
    lookup.get(key).push(tag);
  }

  return lookup;
}

function getEntityLinkSearchLookup() {
  const lookup = new Map();

  for (const link of getAllEntityLinks()) {
    if (link.target_missing) continue;
    const sourceKey = `${link.source_type}:${link.source_id}`;
    const targetKey = `${link.target_type}:${link.target_id}`;
    const linkText = formatEntityLinkForSearch(link);
    const reciprocalText = formatEntityLinkForSearch({
      ...link,
      target_type: link.source_type,
      target_id: link.source_id,
      target_title: link.source_title,
      target_section: link.source_section
    });

    if (!lookup.has(sourceKey)) lookup.set(sourceKey, []);
    if (!lookup.has(targetKey)) lookup.set(targetKey, []);
    lookup.get(sourceKey).push(linkText);
    lookup.get(targetKey).push(reciprocalText);
  }

  return lookup;
}

function getSearchStatusLookup() {
  const lookup = new Map();
  const addRows = (entityType, rows) => {
    for (const row of rows) {
      if (!row.status) continue;
      lookup.set(`${entityType}:${row.id}`, [String(row.status)]);
    }
  };

  addRows('bible_section', connection.prepare('SELECT id, status FROM nodes').all());
  addRows('character', connection.prepare('SELECT id, canon_state AS status FROM characters').all());
  addRows('episode', connection.prepare('SELECT id, status FROM episodes').all());
  addRows('decision', connection.prepare('SELECT id, status FROM decisions').all());
  addRows('question', connection.prepare('SELECT id, status FROM questions').all());
  addRows('living_document', connection.prepare('SELECT id, status FROM living_documents').all());
  addRows('timeline_event', connection.prepare('SELECT id, status FROM timeline_events').all());

  return lookup;
}

function formatTagsForSearch(tagLookup, entityType, entityId) {
  return (tagLookup.get(`${entityType}:${entityId}`) || [])
    .map((tag) => `${tag.label} ${tag.slug} ${tag.slug.replace(/-/g, ' ')} ${tag.note || ''}`)
    .join('\n');
}

function formatLinksForSearch(linkLookup, entityType, entityId) {
  return (linkLookup.get(`${entityType}:${entityId}`) || []).join('\n');
}

function formatEntityLinkForSearch(link) {
  return compactText([
    'linked record',
    formatEntityType(link.target_type),
    link.target_title,
    link.relationship_type,
    link.relationship_type?.replace(/[-_]/g, ' '),
    link.note
  ]);
}

function getEntityTags(entityType, entityId) {
  return getEntityTagLinks().filter((tag) => tag.entity_type === entityType && String(tag.entity_id) === String(entityId));
}

function getContextPack(id) {
  const pack = connection.prepare('SELECT * FROM context_packs WHERE id = ?').get(id);
  if (!pack) return null;

  return {
    ...pack,
    links: getContextPackLinks(pack.id)
  };
}

function getContextPackLinks(packId) {
  return connection
    .prepare('SELECT * FROM context_pack_links WHERE pack_id = ? ORDER BY entity_type, id')
    .all(packId)
    .map((link) => {
      const record = getEntityRecord(link.entity_type, link.entity_id);
      return {
        ...link,
        title: getEntityTitle(link.entity_type, record),
        section: getEntitySection(link.entity_type, record),
        missing: !record
      };
    });
}

function normalizeContextPackTitle(value) {
  return String(value || '').trim().slice(0, 120);
}

function ensureCanonTag(value) {
  const slug = normalizeTagSlug(value);
  if (!slug) return null;

  const existing = connection.prepare('SELECT * FROM canon_tags WHERE slug = ?').get(slug);
  if (existing) return existing;

  const label = formatLabel(slug.replace(/-/g, ' '));
  const result = connection
    .prepare(`
      INSERT INTO canon_tags (slug, label, description, color)
      VALUES (?, ?, ?, 'default')
    `)
    .run(slug, label, `User-added canon tag: ${label}`);

  return connection.prepare('SELECT * FROM canon_tags WHERE id = ?').get(result.lastInsertRowid);
}

function normalizeTagSlug(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function normalizeStatusValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function validateEntityReference(entityType, entityId) {
  if (!getEntityRecord(entityType, entityId)) {
    throw new Error(`Cannot tag missing ${entityType} record.`);
  }
}

function getEntityRecord(entityType, entityId) {
  switch (entityType) {
    case 'bible_section':
      return getNode(entityId);
    case 'episode':
      return getEpisode(entityId);
    case 'character':
      return getCharacter(entityId);
    case 'decision':
      return getDecision(entityId);
    case 'question':
      return getQuestion(entityId);
    case 'timeline_event':
      return getTimelineEvent(entityId);
    case 'living_document':
      return getLivingDocumentEntry(entityId);
    default:
      return null;
  }
}

function hydrateEntityLink(link, currentType, currentId) {
  const currentIsTarget = currentType
    && String(link.target_type) === String(currentType)
    && String(link.target_id) === String(currentId);
  const relatedType = currentIsTarget ? link.source_type : link.target_type;
  const relatedId = currentIsTarget ? link.source_id : link.target_id;
  const relatedRecord = getEntityRecord(relatedType, relatedId);
  const sourceRecord = getEntityRecord(link.source_type, link.source_id);
  const targetRecord = getEntityRecord(link.target_type, link.target_id);

  return {
    ...link,
    direction: currentIsTarget ? 'incoming' : 'outgoing',
    related_type: relatedType,
    related_id: relatedId,
    related_title: getEntityTitle(relatedType, relatedRecord),
    related_section: getEntitySection(relatedType, relatedRecord),
    source_title: getEntityTitle(link.source_type, sourceRecord),
    source_section: getEntitySection(link.source_type, sourceRecord),
    target_title: getEntityTitle(link.target_type, targetRecord),
    target_section: getEntitySection(link.target_type, targetRecord),
    target_missing: !relatedRecord || !sourceRecord || !targetRecord
  };
}

function normalizeEntityLinkInput({ sourceType, sourceId, targetType, targetId, relationshipType, note }) {
  return {
    source_type: normalizeEntityType(sourceType),
    source_id: String(sourceId || '').trim(),
    target_type: normalizeEntityType(targetType),
    target_id: String(targetId || '').trim(),
    relationship_type: normalizeRelationshipType(relationshipType),
    note: String(note || '').trim() || null
  };
}

function normalizeEntityType(entityType) {
  const normalized = String(entityType || '').trim();
  const allowed = new Set(['bible_section', 'episode', 'character', 'decision', 'question', 'timeline_event', 'living_document']);
  if (!allowed.has(normalized)) {
    throw new Error(`Unsupported linked record type: ${entityType}.`);
  }
  return normalized;
}

function normalizeRelationshipType(value) {
  return String(value || 'related')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64) || 'related';
}

function resolveEntityId(entityType, reference = {}) {
  switch (entityType) {
    case 'bible_section':
      return reference.node_id || reference.id;
    case 'episode':
      return connection.prepare('SELECT id FROM episodes WHERE season = ? AND episode_number = ?').get(reference.season, reference.episode_number)?.id || reference.id;
    case 'character':
      return connection.prepare('SELECT id FROM characters WHERE name = ?').get(reference.name)?.id || reference.id;
    case 'decision':
      return connection.prepare('SELECT id FROM decisions WHERE sequence_number = ?').get(reference.sequence_number)?.id || reference.id;
    case 'question':
      return connection.prepare('SELECT id FROM questions WHERE question = ?').get(reference.question)?.id || reference.id;
    case 'timeline_event':
      return connection.prepare('SELECT id FROM timeline_events WHERE seed_key = ?').get(reference.seed_key)?.id || reference.id;
    case 'living_document':
      return connection.prepare('SELECT id FROM living_documents WHERE doc_type = ? AND entry_number = ?').get(reference.doc_type, reference.entry_number)?.id || reference.id;
    default:
      return null;
  }
}

function getEntityTitle(entityType, record) {
  if (!record) return 'Missing record';

  switch (entityType) {
    case 'bible_section':
      return record.title;
    case 'episode':
      return record.title || `S${record.season}E${record.episode_number}`;
    case 'character':
      return record.name;
    case 'decision':
      return record.title;
    case 'question':
      return record.question;
    case 'timeline_event':
      return record.title;
    case 'living_document':
      return `${formatDocType(record.doc_type)} Entry ${record.entry_number || record.id}`;
    default:
      return 'Record';
  }
}

function getEntitySection(entityType, record) {
  if (!record) return 'Missing';

  switch (entityType) {
    case 'bible_section':
      return record.node_type || 'Story Bible';
    case 'episode':
      return `Season ${record.season} / Episode ${record.episode_number}`;
    case 'character':
      return record.role || 'Character';
    case 'decision':
      return `Decision #${record.sequence_number}`;
    case 'question':
      return formatUrgency(record.urgency);
    case 'timeline_event':
      return formatTimelineLocation(record);
    case 'living_document':
      return formatDocType(record.doc_type);
    default:
      return formatEntityType(entityType);
  }
}

function formatEntityType(entityType) {
  const labels = {
    bible_section: 'Story Bible',
    episode: 'Episode',
    character: 'Character',
    decision: 'Decision',
    question: 'Question',
    timeline_event: 'Timeline',
    living_document: 'Living Doc'
  };

  return labels[entityType] || formatLabel(entityType);
}

function getMatchedTags(tags, term) {
  const queryTokens = getSearchTokens(term);
  if (!queryTokens.length) return [];

  return tags.filter((tag) => {
    const tagTokens = getSearchTokens(`${tag.label} ${tag.slug} ${tag.slug.replace(/-/g, ' ')} ${tag.note || ''}`);
    return queryTokens.every((queryToken) => tagTokens.some((tagToken) => tagToken.startsWith(queryToken)));
  });
}

function getMatchedStatuses(statuses, term) {
  const queryTokens = getSearchTokens(term);
  if (!queryTokens.length) return [];

  return statuses.filter((status) => {
    const statusTokens = getSearchTokens(status);
    return queryTokens.every((queryToken) => statusTokens.some((statusToken) => statusToken.startsWith(queryToken)));
  });
}

function getSearchTokens(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/-/g, ' ')
    .split(/\s+/)
    .map((part) => part.replace(/[^\p{L}\p{N}_]/gu, ''))
    .filter(Boolean);
}

function resolveTagEntityId(link) {
  switch (link.entity_type) {
    case 'character':
      return connection.prepare('SELECT id FROM characters WHERE name = ?').get(link.character)?.id;
    case 'timeline_event':
      return connection.prepare('SELECT id FROM timeline_events WHERE seed_key = ?').get(link.seed_key)?.id;
    case 'decision':
      return connection.prepare('SELECT id FROM decisions WHERE sequence_number = ?').get(link.sequence_number)?.id;
    case 'question':
      return connection.prepare('SELECT id FROM questions WHERE question = ?').get(link.question)?.id;
    case 'living_document':
      return connection.prepare('SELECT id FROM living_documents WHERE doc_type = ? AND entry_number = ?').get(link.doc_type, link.entry_number)?.id;
    case 'episode':
      return connection.prepare('SELECT id FROM episodes WHERE season = ? AND episode_number = ?').get(link.season, link.episode_number)?.id;
    default:
      return link.entity_id;
  }
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

function searchIndexHasCanonTagContent() {
  const linkedCanonTags = connection
    .prepare(`
      SELECT COUNT(*) AS count
      FROM entity_tag_links etl
      JOIN canon_tags ct ON ct.id = etl.tag_id
      WHERE ct.slug = 'canon'
    `)
    .get().count;

  if (!linkedCanonTags) return true;

  return connection
    .prepare(`
      SELECT COUNT(*) AS count
      FROM search_index
      WHERE search_index MATCH 'canon*'
        AND EXISTS (
          SELECT 1
          FROM entity_tag_links etl
          JOIN canon_tags ct ON ct.id = etl.tag_id
          WHERE ct.slug = 'canon'
            AND etl.entity_type = search_index.entity_type
            AND etl.entity_id = search_index.entity_id
        )
    `)
    .get().count > 0;
}

function searchIndexHasEntityLinkContent() {
  const linkedRecords = connection.prepare('SELECT COUNT(*) AS count FROM entity_links').get().count;
  if (!linkedRecords) return true;

  return connection.prepare("SELECT value FROM config WHERE key = 'search_index_entity_links'").get()?.value === '1';
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
