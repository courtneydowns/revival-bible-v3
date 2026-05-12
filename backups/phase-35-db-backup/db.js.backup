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

export function createDecision(payload = {}) {
  const title = normalizeNullableText(payload.title) || 'Untitled Decision';
  const result = connection.prepare(`
    INSERT INTO decisions (
      tier, sequence_number, title, question, why_first, what_we_know,
      what_needs_deciding, final_decision, rationale, resolution_notes,
      resolution_history, status, blocks, blocked_by
    )
    VALUES (
      @tier, @sequence_number, @title, @question, @why_first, @what_we_know,
      @what_needs_deciding, @final_decision, @rationale, @resolution_notes,
      '[]', 'proposed', '[]', '[]'
    )
  `).run({
    tier: normalizeInteger(payload.tier, 5),
    sequence_number: nextInteger('decisions', 'sequence_number'),
    title,
    question: normalizeNullableText(payload.question) || title,
    why_first: normalizeNullableText(payload.why_first),
    what_we_know: normalizeNullableText(payload.what_we_know),
    what_needs_deciding: normalizeNullableText(payload.what_needs_deciding),
    final_decision: normalizeNullableText(payload.final_decision),
    rationale: normalizeNullableText(payload.rationale),
    resolution_notes: normalizeNullableText(payload.resolution_notes)
  });

  return {
    ok: true,
    record: getDecision(result.lastInsertRowid),
    search: rebuildSearchIndex()
  };
}

export function deleteDecision(id) {
  const existing = getDecision(id);
  if (!existing) {
    return { ok: false, message: 'Decision not found.' };
  }

  const transaction = connection.transaction(() => {
    connection.prepare("DELETE FROM entity_tag_links WHERE entity_type = 'decision' AND entity_id = ?").run(String(id));
    connection.prepare("DELETE FROM entity_links WHERE (source_type = 'decision' AND source_id = ?) OR (target_type = 'decision' AND target_id = ?)").run(String(id), String(id));
    connection.prepare('DELETE FROM decisions WHERE id = ?').run(id);
  });
  transaction();

  return {
    ok: true,
    deletedId: id,
    search: rebuildSearchIndex()
  };
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

export function createQuestion(payload = {}) {
  const question = normalizeNullableText(payload.question) || 'Untitled Question';
  const result = connection.prepare(`
    INSERT INTO questions (
      question, urgency, status, answer, final_answer, rationale,
      resolution_notes, resolution_history, context, blocks, blocked_by
    )
    VALUES (
      @question, @urgency, 'open', NULL, @final_answer, @rationale,
      @resolution_notes, '[]', @context, '[]', '[]'
    )
  `).run({
    question,
    urgency: normalizeQuestionUrgency(payload.urgency),
    final_answer: normalizeNullableText(payload.final_answer),
    rationale: normalizeNullableText(payload.rationale),
    resolution_notes: normalizeNullableText(payload.resolution_notes),
    context: normalizeNullableText(payload.context)
  });

  return {
    ok: true,
    record: getQuestion(result.lastInsertRowid),
    search: rebuildSearchIndex()
  };
}

export function deleteQuestion(id) {
  const existing = getQuestion(id);
  if (!existing) {
    return { ok: false, message: 'Question not found.' };
  }

  const transaction = connection.transaction(() => {
    connection.prepare("DELETE FROM entity_tag_links WHERE entity_type = 'question' AND entity_id = ?").run(String(id));
    connection.prepare("DELETE FROM entity_links WHERE (source_type = 'question' AND source_id = ?) OR (target_type = 'question' AND target_id = ?)").run(String(id), String(id));
    connection.prepare('DELETE FROM questions WHERE id = ?').run(id);
  });
  transaction();

  return {
    ok: true,
    deletedId: id,
    search: rebuildSearchIndex()
  };
}

export function updateDecisionResolution(payload = {}) {
  const decision = getDecision(payload.id);
  if (!decision) {
    return { ok: false, message: 'Decision not found.' };
  }

  const updates = {
    status: normalizeResolutionStatus(payload.status, [decision.status, 'proposed', 'accepted', 'implemented', 'reversed', 'deprecated'], 'proposed'),
    title: normalizeNullableText(payload.title) || decision.title,
    question: normalizeNullableText(payload.question),
    why_first: normalizeNullableText(payload.why_first),
    what_we_know: normalizeNullableText(payload.what_we_know),
    what_needs_deciding: normalizeNullableText(payload.what_needs_deciding),
    final_decision: normalizeNullableText(payload.final_decision),
    rationale: normalizeNullableText(payload.rationale),
    resolution_notes: normalizeNullableText(payload.resolution_notes)
  };
  const resolution_history = appendResolutionHistory(decision, updates, ['status', 'final_decision', 'rationale', 'resolution_notes']);

  connection.prepare(`
    UPDATE decisions
    SET status = @status,
        title = @title,
        question = @question,
        why_first = @why_first,
        what_we_know = @what_we_know,
        what_needs_deciding = @what_needs_deciding,
        final_decision = @final_decision,
        rationale = @rationale,
        resolution_notes = @resolution_notes,
        resolution_history = @resolution_history
    WHERE id = @id
  `).run({ id: payload.id, ...updates, resolution_history });

  return {
    ok: true,
    record: getDecision(payload.id),
    search: rebuildSearchIndex()
  };
}

export function updateQuestionResolution(payload = {}) {
  const question = getQuestion(payload.id);
  if (!question) {
    return { ok: false, message: 'Question not found.' };
  }

  const updates = {
    status: normalizeResolutionStatus(payload.status, [question.status, 'open', 'tentatively-answered', 'resolved', 'deprecated'], 'open'),
    question: normalizeNullableText(payload.question) || question.question,
    urgency: normalizeQuestionUrgency(payload.urgency || question.urgency),
    context: normalizeNullableText(payload.context),
    final_answer: normalizeNullableText(payload.final_answer),
    rationale: normalizeNullableText(payload.rationale),
    resolution_notes: normalizeNullableText(payload.resolution_notes)
  };
  const resolution_history = appendResolutionHistory(question, updates, ['status', 'final_answer', 'rationale', 'resolution_notes']);

  connection.prepare(`
    UPDATE questions
    SET status = @status,
        question = @question,
        urgency = @urgency,
        context = @context,
        final_answer = @final_answer,
        rationale = @rationale,
        resolution_notes = @resolution_notes,
        resolution_history = @resolution_history
    WHERE id = @id
  `).run({ id: payload.id, ...updates, resolution_history });

  return {
    ok: true,
    record: getQuestion(payload.id),
    search: rebuildSearchIndex()
  };
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

export function getAiSessions() {
  return connection
    .prepare(`
      SELECT id, provider, model, context_type, context_id, template_id, user_instructions, prompt, response, created_at, updated_at
      FROM ai_sessions
      ORDER BY COALESCE(updated_at, created_at) DESC, id DESC
    `)
    .all();
}

export function getAiSession(id) {
  return connection
    .prepare(`
      SELECT id, provider, model, context_type, context_id, template_id, user_instructions, prompt, response, created_at, updated_at
      FROM ai_sessions
      WHERE id = ?
    `)
    .get(id);
}

export function deleteAiSession(id) {
  const existing = getAiSession(id);
  if (!existing) {
    return { ok: false, message: 'AI session was not found.' };
  }

  const result = connection.prepare('DELETE FROM ai_sessions WHERE id = ?').run(existing.id);
  if (!result.changes) {
    return { ok: false, message: 'AI session delete did not change the database.' };
  }

  return { ok: true, deletedId: existing.id };
}

export function createAiSession({
  contextId = '',
  contextType = 'context_pack',
  model = '',
  prompt = '',
  provider = '',
  response = '',
  templateId = '',
  userInstructions = ''
} = {}) {
  const normalizedPrompt = String(prompt || '').trim();
  const normalizedResponse = String(response || '').trim();

  if (!normalizedPrompt) {
    return { ok: false, message: 'Prompt is required.' };
  }

  if (!normalizedResponse) {
    return { ok: false, message: 'Provider response is required.' };
  }

  const result = connection
    .prepare(`
      INSERT INTO ai_sessions (
        session_type,
        context_type,
        context_id,
        messages,
        result,
        provider,
        model,
        prompt,
        response,
        template_id,
        user_instructions
      )
      VALUES (
        'single-response',
        @contextType,
        @contextId,
        @prompt,
        @response,
        @provider,
        @model,
        @prompt,
        @response,
        @templateId,
        @userInstructions
      )
    `)
    .run({
      contextId: String(contextId || ''),
      contextType: String(contextType || 'context_pack'),
      model: String(model || ''),
      prompt: normalizedPrompt,
      provider: String(provider || ''),
      response: normalizedResponse,
      templateId: String(templateId || ''),
      userInstructions: String(userInstructions || '').trim()
    });

  return {
    ok: true,
    session: getAiSession(result.lastInsertRowid)
  };
}

export function getCandidates() {
  return connection
    .prepare('SELECT * FROM candidates ORDER BY COALESCE(updated_at, created_at) DESC, id DESC')
    .all()
    .map(hydrateCandidate);
}

export function getCandidate(id) {
  const candidate = connection.prepare('SELECT * FROM candidates WHERE id = ?').get(id);
  return candidate ? hydrateCandidate(candidate) : null;
}

export function createCandidate({
  title = '',
  content = '',
  type = 'Narrative Note',
  provenanceMetadata = {},
  suggestedLinks = [],
  notes = ''
} = {}) {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) {
    return { ok: false, message: 'Candidate title is required.' };
  }

  const result = connection
    .prepare(`
      INSERT INTO candidates (title, content, type, provenance_metadata, suggested_links, notes)
      VALUES (@title, @content, @type, @provenanceMetadata, @suggestedLinks, @notes)
    `)
    .run({
      title: normalizedTitle,
      content: String(content || '').trim(),
      type: String(type || 'Narrative Note').trim() || 'Narrative Note',
      provenanceMetadata: JSON.stringify(normalizeProvenanceMetadata(provenanceMetadata)),
      suggestedLinks: JSON.stringify(Array.isArray(suggestedLinks) ? suggestedLinks : []),
      notes: String(notes || '').trim()
    });

  return {
    ok: true,
    candidate: getCandidate(result.lastInsertRowid),
    search: rebuildSearchIndex()
  };
}

export function updateCandidateStatus(id, status) {
  const nextStatus = normalizeCandidateStatus(status);
  if (!nextStatus) {
    return { ok: false, message: 'Candidate status is required.' };
  }

  const result = connection
    .prepare('UPDATE candidates SET status = ? WHERE id = ?')
    .run(nextStatus, id);

  if (!result.changes) {
    return { ok: false, message: 'Candidate not found.' };
  }

  return {
    ok: true,
    candidate: getCandidate(id),
    search: rebuildSearchIndex()
  };
}

export function updateCandidate(id, {
  title = '',
  content = '',
  type = 'Narrative Note',
  notes = '',
  tags = null
} = {}) {
  const normalizedTitle = String(title || '').trim();
  if (!normalizedTitle) {
    return { ok: false, message: 'Candidate title is required.' };
  }
  const existing = getCandidate(id);
  if (!existing) {
    return { ok: false, message: 'Candidate not found.' };
  }
  const provenanceMetadata = normalizeCandidateTags(existing.provenance_metadata, tags);

  const result = connection
    .prepare(`
      UPDATE candidates
      SET title = @title,
          content = @content,
          type = @type,
          provenance_metadata = @provenanceMetadata,
          notes = @notes
      WHERE id = @id
    `)
    .run({
      id,
      title: normalizedTitle,
      content: String(content || '').trim(),
      type: String(type || 'Narrative Note').trim() || 'Narrative Note',
      provenanceMetadata: JSON.stringify(provenanceMetadata),
      notes: String(notes || '').trim()
    });

  if (!result.changes) {
    return { ok: false, message: 'Candidate not found.' };
  }

  return {
    ok: true,
    candidate: getCandidate(id),
    search: rebuildSearchIndex()
  };
}

export function deleteCandidate(id) {
  const existing = getCandidate(id);
  if (!existing) {
    return { ok: false, message: 'Candidate not found.' };
  }
  if (existing.status === 'Promoted') {
    return { ok: false, message: 'Promoted candidates are preserved permanently.' };
  }

  const result = connection.prepare('DELETE FROM candidates WHERE id = ?').run(existing.id);
  return {
    ok: result.changes > 0,
    deletedId: existing.id,
    message: result.changes ? undefined : 'Candidate delete did not change the database.',
    search: result.changes ? rebuildSearchIndex() : null
  };
}

export function promoteCandidate(id, payload = {}) {
  const candidate = getCandidate(id);
  if (!candidate) {
    return { ok: false, message: 'Candidate not found.' };
  }

  const targetType = normalizePromotionTarget(payload.targetType);
  if (!targetType) {
    return { ok: false, message: 'Promotion target is required.' };
  }

  const fields = payload.fields && typeof payload.fields === 'object' ? payload.fields : {};
  const title = String(fields.title || candidate.title || '').trim();
  if (!title) {
    return { ok: false, message: 'Promotion title is required.' };
  }

  const promotedAt = new Date().toISOString();
  const provenanceNote = formatPromotionProvenance(candidate, targetType, promotedAt);
  const transaction = connection.transaction(() => {
    const target = createPromotedEntity(targetType, fields, candidate, provenanceNote);
    const promotion = {
      target_type: target.entityType,
      target_id: String(target.id),
      target_label: target.label,
      requested_target: targetType,
      promoted_at: promotedAt,
      title
    };
    const provenance = candidate.provenance_metadata || {};
    const promotions = Array.isArray(provenance.promotions) ? provenance.promotions : [];

    connection
      .prepare('UPDATE candidates SET status = ?, provenance_metadata = ?, notes = ? WHERE id = ?')
      .run(
        'Promoted',
        JSON.stringify({ ...provenance, promotions: [...promotions, promotion] }),
        appendText(candidate.notes, `Promoted to ${target.label} on ${promotedAt}.`),
        candidate.id
      );

    return {
      ok: true,
      candidate: getCandidate(candidate.id),
      target
    };
  });

  const response = transaction();
  rebuildSearchIndex();
  return response;
}

export function getIngestionReviewSummary() {
  return {
    sessions: connection
      .prepare(`
        SELECT *
        FROM import_sessions
        ORDER BY COALESCE(updated_at, created_at) DESC, id DESC
        LIMIT 8
      `)
      .all()
      .map(hydrateProvenanceRow),
    unresolvedExtractions: connection
      .prepare(`
        SELECT ee.*, smr.source_label
        FROM editorial_extractions ee
        LEFT JOIN source_memory_records smr ON smr.id = ee.source_record_id
        WHERE ee.status IN ('unresolved', 'in-review', 'pending-placement')
        ORDER BY COALESCE(ee.updated_at, ee.created_at) DESC, ee.id DESC
        LIMIT 8
      `)
      .all()
      .map(hydrateProvenanceRow),
    duplicateReviews: connection
      .prepare(`
        SELECT *
        FROM possible_duplicate_links
        WHERE status IN ('pending', 'review-later')
        ORDER BY COALESCE(updated_at, created_at) DESC, id DESC
        LIMIT 8
      `)
      .all()
      .map(hydrateProvenanceRow),
    continuityReviews: connection
      .prepare(`
        SELECT *
        FROM continuity_review_items
        WHERE status IN ('open', 'review-later')
        ORDER BY COALESCE(updated_at, created_at) DESC, id DESC
        LIMIT 8
      `)
      .all()
      .map(hydrateProvenanceRow),
    narrativeFragments: connection
      .prepare(`
        SELECT nf.*, smr.source_label
        FROM narrative_fragments nf
        LEFT JOIN source_memory_records smr ON smr.id = nf.source_record_id
        WHERE nf.status IN ('unplaced', 'review-later')
        ORDER BY COALESCE(nf.updated_at, nf.created_at) DESC, nf.id DESC
        LIMIT 8
      `)
      .all()
      .map(hydrateProvenanceRow)
  };
}

export function createImportSession(payload = {}) {
  const title = normalizeNullableText(payload.title) || 'Untitled import session';
  const result = connection
    .prepare(`
      INSERT INTO import_sessions (title, source_type, status, notes, provenance_metadata)
      VALUES (@title, @sourceType, @status, @notes, @provenanceMetadata)
    `)
    .run({
      title,
      sourceType: normalizeReviewToken(payload.sourceType, 'manual'),
      status: normalizeReviewToken(payload.status, 'active'),
      notes: String(payload.notes || '').trim(),
      provenanceMetadata: JSON.stringify(normalizeFrameworkProvenance(payload.provenanceMetadata))
    });

  return {
    ok: true,
    session: hydrateProvenanceRow(connection.prepare('SELECT * FROM import_sessions WHERE id = ?').get(result.lastInsertRowid))
  };
}

export function createSourceMemoryRecord(payload = {}) {
  const rawContent = String(payload.rawContent || payload.raw_content || '').trim();
  if (!rawContent) {
    return { ok: false, message: 'Source content is required.' };
  }

  const sessionId = normalizeExistingImportSessionId(payload.importSessionId || payload.import_session_id);
  const result = connection
    .prepare(`
      INSERT INTO source_memory_records (
        import_session_id, source_label, source_type, raw_content, checksum, provenance_metadata
      )
      VALUES (
        @importSessionId, @sourceLabel, @sourceType, @rawContent, @checksum, @provenanceMetadata
      )
    `)
    .run({
      importSessionId: sessionId,
      sourceLabel: normalizeNullableText(payload.sourceLabel || payload.source_label) || 'Untitled source',
      sourceType: normalizeReviewToken(payload.sourceType || payload.source_type, 'note'),
      rawContent,
      checksum: String(payload.checksum || '').trim() || null,
      provenanceMetadata: JSON.stringify(normalizeFrameworkProvenance(payload.provenanceMetadata))
    });

  touchImportSession(sessionId);
  return {
    ok: true,
    source: hydrateProvenanceRow(connection.prepare('SELECT * FROM source_memory_records WHERE id = ?').get(result.lastInsertRowid))
  };
}

export function createEditorialExtraction(payload = {}) {
  const title = normalizeNullableText(payload.title) || 'Untitled extraction';
  const sourceRecordId = normalizeExistingSourceRecordId(payload.sourceRecordId || payload.source_record_id);
  const importSessionId = normalizeExistingImportSessionId(payload.importSessionId || payload.import_session_id)
    || getImportSessionIdForSource(sourceRecordId);
  const result = connection
    .prepare(`
      INSERT INTO editorial_extractions (
        import_session_id, source_record_id, title, content, classification,
        confidence_state, trust_reason, status, provenance_metadata
      )
      VALUES (
        @importSessionId, @sourceRecordId, @title, @content, @classification,
        @confidenceState, @trustReason, @status, @provenanceMetadata
      )
    `)
    .run({
      importSessionId,
      sourceRecordId,
      title,
      content: String(payload.content || '').trim(),
      classification: normalizeExtractionClassification(payload.classification),
      confidenceState: normalizeConfidenceState(payload.confidenceState || payload.confidence_state, 'weak'),
      trustReason: String(payload.trustReason || payload.trust_reason || '').trim(),
      status: normalizeReviewToken(payload.status, 'unresolved'),
      provenanceMetadata: JSON.stringify(normalizeFrameworkProvenance({
        ...payload.provenanceMetadata,
        source_record_id: sourceRecordId,
        import_session_id: importSessionId
      }))
    });

  touchImportSession(importSessionId);
  return {
    ok: true,
    extraction: hydrateProvenanceRow(connection.prepare('SELECT * FROM editorial_extractions WHERE id = ?').get(result.lastInsertRowid))
  };
}

export function createPossibleDuplicateLink(payload = {}) {
  const left = normalizeReviewEndpoint(payload.left || {
    type: payload.leftType || payload.left_type,
    id: payload.leftId || payload.left_id
  });
  const right = normalizeReviewEndpoint(payload.right || {
    type: payload.rightType || payload.right_type,
    id: payload.rightId || payload.right_id
  });
  if (!left || !right) {
    return { ok: false, message: 'Both duplicate records are required.' };
  }

  connection
    .prepare(`
      INSERT INTO possible_duplicate_links (
        left_type, left_id, right_type, right_id, confidence, reason, status, provenance_metadata
      )
      VALUES (
        @leftType, @leftId, @rightType, @rightId, @confidence, @reason, 'pending', @provenanceMetadata
      )
      ON CONFLICT(left_type, left_id, right_type, right_id) DO UPDATE SET
        confidence = excluded.confidence,
        reason = excluded.reason,
        status = 'pending',
        provenance_metadata = excluded.provenance_metadata
    `)
    .run({
      leftType: left.type,
      leftId: left.id,
      rightType: right.type,
      rightId: right.id,
      confidence: normalizeConfidenceState(payload.confidence, 'weak'),
      reason: String(payload.reason || '').trim(),
      provenanceMetadata: JSON.stringify(normalizeFrameworkProvenance(payload.provenanceMetadata))
    });

  const duplicate = connection
    .prepare(`
      SELECT *
      FROM possible_duplicate_links
      WHERE left_type = ? AND left_id = ? AND right_type = ? AND right_id = ?
    `)
    .get(left.type, left.id, right.type, right.id);

  return { ok: true, duplicate: hydrateProvenanceRow(duplicate) };
}

export function updatePossibleDuplicateReview(payload = {}) {
  const status = normalizeDuplicateReviewStatus(payload.status);
  if (!status) {
    return { ok: false, message: 'Duplicate review status is required.' };
  }

  const existing = connection.prepare('SELECT * FROM possible_duplicate_links WHERE id = ?').get(payload.id);
  if (!existing) {
    return { ok: false, message: 'Duplicate review item not found.' };
  }

  connection
    .prepare('UPDATE possible_duplicate_links SET status = ?, reason = ? WHERE id = ?')
    .run(status, String(payload.reason || existing.reason || '').trim(), existing.id);

  return {
    ok: true,
    duplicate: hydrateProvenanceRow(connection.prepare('SELECT * FROM possible_duplicate_links WHERE id = ?').get(existing.id))
  };
}

export function createContinuityReviewItem(payload = {}) {
  const title = normalizeNullableText(payload.title) || 'Untitled continuity review';
  const result = connection
    .prepare(`
      INSERT INTO continuity_review_items (
        review_type, title, claim_a, claim_b, confidence_state, risk_level, status, provenance_metadata
      )
      VALUES (
        @reviewType, @title, @claimA, @claimB, @confidenceState, @riskLevel, 'open', @provenanceMetadata
      )
    `)
    .run({
      reviewType: normalizeReviewToken(payload.reviewType || payload.review_type, 'continuity-risk'),
      title,
      claimA: String(payload.claimA || payload.claim_a || '').trim(),
      claimB: String(payload.claimB || payload.claim_b || '').trim(),
      confidenceState: normalizeConfidenceState(payload.confidenceState || payload.confidence_state, 'contradictory'),
      riskLevel: normalizeReviewToken(payload.riskLevel || payload.risk_level, 'review'),
      provenanceMetadata: JSON.stringify(normalizeFrameworkProvenance(payload.provenanceMetadata))
    });

  return {
    ok: true,
    item: hydrateProvenanceRow(connection.prepare('SELECT * FROM continuity_review_items WHERE id = ?').get(result.lastInsertRowid))
  };
}

export function updateContinuityReviewItem(payload = {}) {
  const status = normalizeContinuityReviewStatus(payload.status);
  if (!status) {
    return { ok: false, message: 'Continuity review status is required.' };
  }

  const existing = connection.prepare('SELECT * FROM continuity_review_items WHERE id = ?').get(payload.id);
  if (!existing) {
    return { ok: false, message: 'Continuity review item not found.' };
  }

  connection
    .prepare('UPDATE continuity_review_items SET status = ?, risk_level = ? WHERE id = ?')
    .run(status, normalizeReviewToken(payload.riskLevel || payload.risk_level, existing.risk_level), existing.id);

  return {
    ok: true,
    item: hydrateProvenanceRow(connection.prepare('SELECT * FROM continuity_review_items WHERE id = ?').get(existing.id))
  };
}

export function createNarrativeFragment(payload = {}) {
  const sourceRecordId = normalizeExistingSourceRecordId(payload.sourceRecordId || payload.source_record_id);
  const result = connection
    .prepare(`
      INSERT INTO narrative_fragments (
        source_record_id, title, content, fragment_type, confidence_state, status, provenance_metadata
      )
      VALUES (
        @sourceRecordId, @title, @content, @fragmentType, @confidenceState, @status, @provenanceMetadata
      )
    `)
    .run({
      sourceRecordId,
      title: normalizeNullableText(payload.title) || 'Untitled narrative fragment',
      content: String(payload.content || '').trim(),
      fragmentType: normalizeReviewToken(payload.fragmentType || payload.fragment_type, 'story-material'),
      confidenceState: normalizeConfidenceState(payload.confidenceState || payload.confidence_state, 'speculative'),
      status: normalizeReviewToken(payload.status, 'unplaced'),
      provenanceMetadata: JSON.stringify(normalizeFrameworkProvenance({
        ...payload.provenanceMetadata,
        source_record_id: sourceRecordId
      }))
    });

  return {
    ok: true,
    fragment: hydrateProvenanceRow(connection.prepare('SELECT * FROM narrative_fragments WHERE id = ?').get(result.lastInsertRowid))
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
        decision.final_decision,
        decision.rationale,
        decision.resolution_notes,
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
        question.final_answer,
        question.rationale,
        question.resolution_notes,
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

  for (const candidate of getCandidates()) {
    rows.push({
      entity_type: 'candidate',
      entity_id: String(candidate.id),
      title: candidate.title,
      content: compactText([
        candidate.title,
        candidate.type,
        candidate.status,
        candidate.content,
        candidate.notes,
        formatCandidateTagsForSearch(candidate)
      ]),
      section_path: 'Candidates Inbox'
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

  for (const candidate of getCandidates()) {
    const candidateTags = Array.isArray(candidate?.provenance_metadata?.tags) ? candidate.provenance_metadata.tags : [];
    if (!candidateTags.length) continue;
    const key = `candidate:${candidate.id}`;
    if (!lookup.has(key)) lookup.set(key, []);
    candidateTags.forEach((tag) => {
      const slug = normalizeTagSlug(typeof tag === 'string' ? tag : tag?.slug || tag?.label);
      if (!slug) return;
      lookup.get(key).push({
        slug,
        label: typeof tag === 'object' && tag?.label ? tag.label : formatLabel(slug.replace(/-/g, ' ')),
        color: 'default',
        note: ''
      });
    });
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
  addRows('candidate', connection.prepare('SELECT id, status FROM candidates').all());

  return lookup;
}

function formatTagsForSearch(tagLookup, entityType, entityId) {
  return (tagLookup.get(`${entityType}:${entityId}`) || [])
    .map((tag) => `${tag.label} ${tag.slug} ${tag.slug.replace(/-/g, ' ')} ${tag.note || ''}`)
    .join('\n');
}

function formatCandidateTagsForSearch(candidate) {
  const tags = Array.isArray(candidate?.provenance_metadata?.tags) ? candidate.provenance_metadata.tags : [];
  return tags
    .map((tag) => {
      const slug = normalizeTagSlug(typeof tag === 'string' ? tag : tag?.slug || tag?.label);
      if (!slug) return '';
      const label = typeof tag === 'object' && tag?.label ? tag.label : formatLabel(slug.replace(/-/g, ' '));
      return `${label} ${slug} ${slug.replace(/-/g, ' ')}`;
    })
    .filter(Boolean)
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

function normalizeResolutionStatus(value, allowed, fallback) {
  const status = normalizeStatusValue(value);
  const normalizedAllowed = allowed.map((item) => normalizeStatusValue(item)).filter(Boolean);
  return normalizedAllowed.includes(status) ? status : fallback;
}

function normalizeNullableText(value) {
  const text = String(value || '').trim();
  return text || null;
}

function normalizeInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

function appendResolutionHistory(record, updates, fields) {
  const changed = fields.filter((field) => String(record[field] || '') !== String(updates[field] || ''));
  if (!changed.length) {
    return record.resolution_history || '[]';
  }

  const history = parseJsonArray(record.resolution_history).slice(-19);
  history.push({
    at: new Date().toISOString(),
    previous: changed.reduce((previous, field) => {
      previous[field] = record[field] || null;
      return previous;
    }, {})
  });
  return JSON.stringify(history);
}

function normalizeCandidateStatus(value) {
  const label = String(value || '').trim().toLowerCase();
  const allowed = {
    new: 'New',
    'in review': 'In Review',
    'in-review': 'In Review',
    accepted: 'Accepted / Needs Placement',
    'needs placement': 'Accepted / Needs Placement',
    'needs-placement': 'Accepted / Needs Placement',
    'accepted needs placement': 'Accepted / Needs Placement',
    'accepted-needs-placement': 'Accepted / Needs Placement',
    'accepted / needs placement': 'Accepted / Needs Placement',
    promoted: 'Promoted',
    rejected: 'Rejected'
  };

  return allowed[label] || null;
}

function normalizePromotionTarget(value) {
  const normalized = String(value || '').trim();
  const allowed = new Set(['character', 'episode', 'decision', 'question', 'location', 'bible_section']);
  return allowed.has(normalized) ? normalized : null;
}

function normalizeProvenanceMetadata(value) {
  const provenance = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    ...provenance,
    source: String(provenance.source || 'Manual editorial note').trim(),
    source_id: String(provenance.source_id || '').trim(),
    source_title: String(provenance.source_title || '').trim(),
    provider: String(provenance.provider || '').trim(),
    model: String(provenance.model || '').trim(),
    template_id: String(provenance.template_id || '').trim(),
    template: String(provenance.template || '').trim(),
    workflow: String(provenance.workflow || 'Candidate Inbox').trim(),
    created_at: String(provenance.created_at || new Date().toISOString()).trim()
  };
}

function normalizeCandidateTags(provenanceMetadata = {}, tags = null) {
  const metadata = normalizeProvenanceMetadata(provenanceMetadata);
  if (!Array.isArray(tags)) return metadata;

  const normalizedTags = [];
  const seen = new Set();
  for (const tag of tags) {
    const slug = normalizeTagSlug(typeof tag === 'string' ? tag : tag?.slug || tag?.label || tag?.name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    normalizedTags.push({
      slug,
      label: typeof tag === 'object' && tag?.label ? String(tag.label).trim() : formatLabel(slug.replace(/-/g, ' '))
    });
  }

  return {
    ...metadata,
    tags: normalizedTags.slice(0, 24)
  };
}

function normalizeFrameworkProvenance(value = {}) {
  const provenance = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return {
    ...provenance,
    memory_layer: String(provenance.memory_layer || 'editorial').trim(),
    preserved: provenance.preserved === false ? false : true,
    canon_mutation: false,
    created_at: String(provenance.created_at || new Date().toISOString()).trim()
  };
}

function hydrateProvenanceRow(row) {
  if (!row) return null;
  return {
    ...row,
    provenance_metadata: parseJsonObject(row.provenance_metadata)
  };
}

function normalizeConfidenceState(value, fallback = 'weak') {
  const normalized = normalizeReviewToken(value, fallback);
  const allowed = new Set(['explicit', 'strong', 'weak', 'inferred', 'contradictory', 'deprecated', 'speculative']);
  return allowed.has(normalized) ? normalized : fallback;
}

function normalizeExtractionClassification(value) {
  const normalized = normalizeReviewToken(value, 'candidate');
  const allowed = new Set([
    'candidate',
    'unresolved-question',
    'continuity-risk',
    'possible-duplicate',
    'contradiction',
    'narrative-fragment',
    'story-material',
    'scene-fragment',
    'pending-placement'
  ]);
  return allowed.has(normalized) ? normalized : 'candidate';
}

function normalizeDuplicateReviewStatus(value) {
  const normalized = normalizeReviewToken(value, '');
  const allowed = new Set(['pending', 'confirmed-merge', 'rejected', 'review-later']);
  return allowed.has(normalized) ? normalized : null;
}

function normalizeContinuityReviewStatus(value) {
  const normalized = normalizeReviewToken(value, '');
  const allowed = new Set(['open', 'resolved', 'rejected', 'review-later']);
  return allowed.has(normalized) ? normalized : null;
}

function normalizeReviewToken(value, fallback = '') {
  const normalized = String(value || fallback || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return normalized || fallback;
}

function normalizeReviewEndpoint(endpoint = {}) {
  const type = normalizeReviewToken(endpoint.type || endpoint.entity_type || '');
  const id = String(endpoint.id || endpoint.entity_id || '').trim();
  if (!type || !id) return null;
  return { type, id };
}

function normalizeExistingImportSessionId(id) {
  const normalizedId = normalizeInteger(id, 0);
  if (!normalizedId) return null;
  const exists = connection.prepare('SELECT id FROM import_sessions WHERE id = ?').get(normalizedId);
  return exists ? normalizedId : null;
}

function normalizeExistingSourceRecordId(id) {
  const normalizedId = normalizeInteger(id, 0);
  if (!normalizedId) return null;
  const exists = connection.prepare('SELECT id FROM source_memory_records WHERE id = ?').get(normalizedId);
  return exists ? normalizedId : null;
}

function getImportSessionIdForSource(sourceRecordId) {
  if (!sourceRecordId) return null;
  return connection
    .prepare('SELECT import_session_id FROM source_memory_records WHERE id = ?')
    .get(sourceRecordId)?.import_session_id || null;
}

function touchImportSession(importSessionId) {
  if (!importSessionId) return;
  connection.prepare('UPDATE import_sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(importSessionId);
}

function createPromotedEntity(targetType, fields, candidate, provenanceNote) {
  switch (targetType) {
    case 'character':
      return createPromotedCharacter(fields, candidate, provenanceNote);
    case 'episode':
      return createPromotedEpisode(fields, candidate, provenanceNote);
    case 'decision':
      return createPromotedDecision(fields, candidate, provenanceNote);
    case 'question':
      return createPromotedQuestion(fields, candidate, provenanceNote);
    case 'location':
      return createPromotedLocation(fields, candidate, provenanceNote);
    case 'bible_section':
      return createPromotedBibleSection(fields, candidate, provenanceNote);
    default:
      throw new Error(`Unsupported promotion target: ${targetType}`);
  }
}

function createPromotedCharacter(fields, candidate, provenanceNote) {
  const name = String(fields.title || candidate.title || '').trim();
  const result = connection
    .prepare(`
      INSERT INTO characters (name, role, canon_state, notes, position)
      VALUES (@name, @role, 'developing', @notes, @position)
    `)
    .run({
      name,
      role: String(fields.role || 'Candidate Promotion').trim(),
      notes: appendText(String(fields.content || candidate.content || '').trim(), provenanceNote),
      position: nextInteger('characters', 'position')
    });

  return { entityType: 'character', id: result.lastInsertRowid, label: 'Character' };
}

function createPromotedEpisode(fields, candidate, provenanceNote) {
  const season = clampInteger(fields.season, 1, 3, 1);
  const episodeNumber = clampInteger(fields.episode_number, 1, 99, nextEpisodeNumber(season));
  const result = connection
    .prepare(`
      INSERT INTO episodes (season, episode_number, title, arc_summary, rewatch_notes, status)
      VALUES (@season, @episode_number, @title, @arc_summary, @rewatch_notes, 'developing')
    `)
    .run({
      season,
      episode_number: episodeNumber,
      title: String(fields.title || candidate.title || '').trim(),
      arc_summary: String(fields.content || candidate.content || '').trim(),
      rewatch_notes: provenanceNote
    });

  return { entityType: 'episode', id: result.lastInsertRowid, label: 'Episode' };
}

function createPromotedDecision(fields, candidate, provenanceNote) {
  const result = connection
    .prepare(`
      INSERT INTO decisions (
        tier, sequence_number, title, question, what_we_know, what_needs_deciding, status, blocks, blocked_by
      )
      VALUES (
        @tier, @sequence_number, @title, @question, @what_we_know, @what_needs_deciding, 'needed', '[]', '[]'
      )
    `)
    .run({
      tier: clampInteger(fields.tier, 1, 5, 5),
      sequence_number: nextInteger('decisions', 'sequence_number'),
      title: String(fields.title || candidate.title || '').trim(),
      question: String(fields.question || '').trim(),
      what_we_know: provenanceNote,
      what_needs_deciding: String(fields.content || candidate.content || '').trim()
    });

  return { entityType: 'decision', id: result.lastInsertRowid, label: 'Decision' };
}

function createPromotedQuestion(fields, candidate, provenanceNote) {
  const result = connection
    .prepare(`
      INSERT INTO questions (question, urgency, status, context, blocks, blocked_by)
      VALUES (@question, @urgency, 'open', @context, '[]', '[]')
    `)
    .run({
      question: String(fields.title || candidate.title || '').trim(),
      urgency: normalizeQuestionUrgency(fields.urgency),
      context: appendText(String(fields.content || candidate.content || '').trim(), provenanceNote)
    });

  return { entityType: 'question', id: result.lastInsertRowid, label: 'Question' };
}

function createPromotedLocation(fields, candidate, provenanceNote) {
  const result = connection
    .prepare(`
      INSERT INTO living_documents (doc_type, entry_number, fields, status)
      VALUES ('locations', @entry_number, @fields, 'DEVELOPING')
    `)
    .run({
      entry_number: nextLivingDocumentEntryNumber('locations'),
      fields: JSON.stringify({
        title: String(fields.title || candidate.title || '').trim(),
        summary: String(fields.content || candidate.content || '').trim(),
        provenance: provenanceNote
      })
    });

  return { entityType: 'living_document', id: result.lastInsertRowid, label: 'Location' };
}

function createPromotedBibleSection(fields, candidate, provenanceNote) {
  const parentId = String(fields.parent_id || 'section-13').trim();
  const parent = getNode(parentId) || getNode('section-13') || getNodeTree().find((node) => !node.parent_id);
  const nodeId = createNodeId(String(fields.title || candidate.title || '').trim());
  const position = nextNodePosition(parent?.id || null);

  connection
    .prepare(`
      INSERT INTO nodes (id, parent_id, title, node_type, position, status, metadata)
      VALUES (@id, @parent_id, @title, 'subsection', @position, 'DEVELOPING', @metadata)
    `)
    .run({
      id: nodeId,
      parent_id: parent?.id || null,
      title: String(fields.title || candidate.title || '').trim(),
      position,
      metadata: JSON.stringify({
        promoted_from_candidate: String(candidate.id),
        source: 'Candidate Promotion'
      })
    });

  connection
    .prepare(`
      INSERT INTO node_content (id, node_id, content, version, session_origin)
      VALUES (@id, @node_id, @content, 1, 'candidate_promotion')
    `)
    .run({
      id: `content-${nodeId}-candidate-${candidate.id}`,
      node_id: nodeId,
      content: appendText(String(fields.content || candidate.content || '').trim(), provenanceNote)
    });

  return { entityType: 'bible_section', id: nodeId, label: 'Story Bible entry' };
}

function validateEntityReference(entityType, entityId) {
  if (!getEntityRecord(entityType, entityId)) {
    throw new Error(`Cannot tag missing ${entityType} record.`);
  }
}

function hydrateCandidate(candidate) {
  return {
    ...candidate,
    provenance_metadata: parseJsonObject(candidate.provenance_metadata),
    suggested_links: parseJsonArray(candidate.suggested_links)
  };
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
    candidate: 'Candidate',
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
    'timeline_events',
    'candidates'
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

function appendText(base, addition) {
  return [String(base || '').trim(), String(addition || '').trim()].filter(Boolean).join('\n\n');
}

function formatPromotionProvenance(candidate, targetType, promotedAt) {
  const provenance = candidate.provenance_metadata || {};
  const source = provenance.source_id ? `${provenance.source || 'Source'} #${provenance.source_id}` : provenance.source || 'Manual editorial note';
  return `Promoted from Candidate #${candidate.id} (${candidate.title}) to ${formatPromotionTarget(targetType)} on ${promotedAt}. Original source: ${source}.`;
}

function formatPromotionTarget(targetType) {
  const labels = {
    character: 'Character',
    episode: 'Episode',
    decision: 'Decision',
    question: 'Question',
    location: 'Location',
    bible_section: 'Story Bible entry'
  };
  return labels[targetType] || formatLabel(targetType);
}

function nextInteger(tableName, columnName) {
  const allowed = {
    characters: 'position',
    decisions: 'sequence_number'
  };
  if (allowed[tableName] !== columnName) return 1;
  return (connection.prepare(`SELECT COALESCE(MAX(${columnName}), 0) + 1 AS value FROM ${tableName}`).get()?.value || 1);
}

function nextEpisodeNumber(season) {
  return (connection.prepare('SELECT COALESCE(MAX(episode_number), 0) + 1 AS value FROM episodes WHERE season = ?').get(season)?.value || 1);
}

function nextLivingDocumentEntryNumber(docType) {
  return (connection.prepare('SELECT COALESCE(MAX(entry_number), 0) + 1 AS value FROM living_documents WHERE doc_type = ?').get(docType)?.value || 1);
}

function nextNodePosition(parentId) {
  return (connection.prepare('SELECT COALESCE(MAX(position), 0) + 1 AS value FROM nodes WHERE parent_id IS ?').get(parentId || null)?.value || 1);
}

function clampInteger(value, min, max, fallback) {
  const number = Number.parseInt(value, 10);
  if (Number.isNaN(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function normalizeQuestionUrgency(value) {
  const normalized = String(value || '').trim();
  return ['pinned', 'tier1', 'tier2', 'tier3'].includes(normalized) ? normalized : 'tier3';
}

function createNodeId(title) {
  const base = String(title || 'candidate-entry')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'candidate-entry';
  let id = `candidate-${base}`;
  let suffix = 2;

  while (getNode(id)) {
    id = `candidate-${base}-${suffix}`;
    suffix += 1;
  }

  return id;
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

function parseJsonArray(value) {
  const parsed = parseJsonValue(value);
  return Array.isArray(parsed) ? parsed : [];
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
