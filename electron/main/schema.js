export function initializeSchema(db) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS nodes (
      id TEXT PRIMARY KEY,
      parent_id TEXT,
      title TEXT NOT NULL,
      node_type TEXT NOT NULL,
      position INTEGER,
      status TEXT DEFAULT 'DEVELOPING',
      metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS node_content (
      id TEXT PRIMARY KEY,
      node_id TEXT NOT NULL,
      content TEXT,
      version INTEGER DEFAULT 1,
      session_origin TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS episodes (
      id INTEGER PRIMARY KEY,
      season INTEGER NOT NULL,
      episode_number INTEGER NOT NULL,
      title TEXT,
      na_tradition TEXT,
      dual_meaning TEXT,
      arc_summary TEXT,
      thematic_core TEXT,
      cold_open TEXT,
      acts TEXT DEFAULT '[]',
      flanagan_moment TEXT,
      rewatch_notes TEXT,
      status TEXT DEFAULT 'developing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      canon_state TEXT DEFAULT 'developing',
      status_at_open TEXT,
      arc_season_1 TEXT,
      arc_season_2 TEXT,
      arc_season_3 TEXT,
      what_they_carry TEXT,
      what_they_wont TEXT,
      voice_notes TEXT,
      end_state TEXT,
      notes TEXT,
      position INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS character_relationships (
      id INTEGER PRIMARY KEY,
      character_a_id INTEGER NOT NULL,
      character_b_id INTEGER NOT NULL,
      relationship_type TEXT NOT NULL,
      detail TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (character_a_id) REFERENCES characters(id) ON DELETE CASCADE,
      FOREIGN KEY (character_b_id) REFERENCES characters(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS decisions (
      id INTEGER PRIMARY KEY,
      tier INTEGER NOT NULL,
      sequence_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      question TEXT,
      why_first TEXT,
      what_we_know TEXT,
      what_needs_deciding TEXT,
      answer TEXT,
      final_decision TEXT,
      rationale TEXT,
      resolution_notes TEXT,
      resolution_history TEXT DEFAULT '[]',
      status TEXT DEFAULT 'needed',
      blocks TEXT DEFAULT '[]',
      blocked_by TEXT DEFAULT '[]',
      locked_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY,
      question TEXT NOT NULL,
      urgency TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      answer TEXT,
      final_answer TEXT,
      rationale TEXT,
      resolution_notes TEXT,
      resolution_history TEXT DEFAULT '[]',
      context TEXT,
      blocks TEXT DEFAULT '[]',
      blocked_by TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS living_documents (
      id INTEGER PRIMARY KEY,
      doc_type TEXT NOT NULL,
      entry_number INTEGER,
      fields TEXT NOT NULL,
      status TEXT DEFAULT 'DEVELOPING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timeline_events (
      id INTEGER PRIMARY KEY,
      seed_key TEXT UNIQUE NOT NULL,
      season INTEGER,
      episode_number INTEGER,
      chronology_bucket TEXT NOT NULL,
      outbreak_phase TEXT NOT NULL,
      event_type TEXT NOT NULL,
      title TEXT NOT NULL,
      summary TEXT,
      source_note TEXT,
      position INTEGER NOT NULL,
      status TEXT DEFAULT 'DEVELOPING',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS canon_tags (
      id INTEGER PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      label TEXT NOT NULL,
      description TEXT,
      color TEXT DEFAULT 'default',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS entity_tag_links (
      id INTEGER PRIMARY KEY,
      tag_id INTEGER NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(tag_id, entity_type, entity_id),
      FOREIGN KEY (tag_id) REFERENCES canon_tags(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS entity_links (
      id INTEGER PRIMARY KEY,
      source_type TEXT NOT NULL,
      source_id TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relationship_type TEXT DEFAULT 'related',
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(source_type, source_id, target_type, target_id, relationship_type)
    );

    CREATE TABLE IF NOT EXISTS context_packs (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      purpose TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS context_pack_links (
      id INTEGER PRIMARY KEY,
      pack_id INTEGER NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(pack_id, entity_type, entity_id),
      FOREIGN KEY (pack_id) REFERENCES context_packs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY,
      focus_type TEXT,
      focus_ids TEXT,
      decisions_since_last TEXT,
      context_snapshot TEXT,
      output TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ai_sessions (
      id INTEGER PRIMARY KEY,
      session_type TEXT,
      context_type TEXT,
      context_id TEXT,
      messages TEXT,
      result TEXT,
      provider TEXT,
      model TEXT,
      prompt TEXT,
      response TEXT,
      template_id TEXT,
      user_instructions TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS candidates (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      status TEXT DEFAULT 'New',
      type TEXT DEFAULT 'Narrative Note',
      provenance_metadata TEXT DEFAULT '{}',
      suggested_links TEXT DEFAULT '[]',
      notes TEXT DEFAULT '',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS import_sessions (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      source_type TEXT DEFAULT 'manual',
      status TEXT DEFAULT 'active',
      notes TEXT DEFAULT '',
      provenance_metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS source_memory_records (
      id INTEGER PRIMARY KEY,
      import_session_id INTEGER,
      source_label TEXT NOT NULL,
      source_type TEXT DEFAULT 'note',
      raw_content TEXT NOT NULL,
      checksum TEXT,
      provenance_metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (import_session_id) REFERENCES import_sessions(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS editorial_extractions (
      id INTEGER PRIMARY KEY,
      import_session_id INTEGER,
      source_record_id INTEGER,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      classification TEXT DEFAULT 'candidate',
      confidence_state TEXT DEFAULT 'weak',
      trust_reason TEXT DEFAULT '',
      status TEXT DEFAULT 'unresolved',
      provenance_metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (import_session_id) REFERENCES import_sessions(id) ON DELETE SET NULL,
      FOREIGN KEY (source_record_id) REFERENCES source_memory_records(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS possible_duplicate_links (
      id INTEGER PRIMARY KEY,
      left_type TEXT NOT NULL,
      left_id TEXT NOT NULL,
      right_type TEXT NOT NULL,
      right_id TEXT NOT NULL,
      confidence TEXT DEFAULT 'weak',
      reason TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      provenance_metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(left_type, left_id, right_type, right_id)
    );

    CREATE TABLE IF NOT EXISTS continuity_review_items (
      id INTEGER PRIMARY KEY,
      review_type TEXT DEFAULT 'continuity-risk',
      title TEXT NOT NULL,
      claim_a TEXT DEFAULT '',
      claim_b TEXT DEFAULT '',
      confidence_state TEXT DEFAULT 'contradictory',
      risk_level TEXT DEFAULT 'review',
      status TEXT DEFAULT 'open',
      provenance_metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS narrative_fragments (
      id INTEGER PRIMARY KEY,
      source_record_id INTEGER,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      fragment_type TEXT DEFAULT 'story-material',
      confidence_state TEXT DEFAULT 'speculative',
      status TEXT DEFAULT 'unplaced',
      provenance_metadata TEXT DEFAULT '{}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (source_record_id) REFERENCES source_memory_records(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_source_memory_import_session
      ON source_memory_records(import_session_id);

    CREATE INDEX IF NOT EXISTS idx_editorial_extractions_review
      ON editorial_extractions(status, confidence_state, classification);

    CREATE INDEX IF NOT EXISTS idx_possible_duplicate_review
      ON possible_duplicate_links(status, confidence);

    CREATE INDEX IF NOT EXISTS idx_continuity_review_items_status
      ON continuity_review_items(status, risk_level);

    CREATE TABLE IF NOT EXISTS exports (
      id INTEGER PRIMARY KEY,
      format TEXT,
      scope TEXT,
      scope_id TEXT,
      path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts5(
      entity_type,
      entity_id,
      title,
      content,
      section_path
    );
  `);

  createUpdatedAtTrigger(db, 'nodes');
  createUpdatedAtTrigger(db, 'episodes');
  createUpdatedAtTrigger(db, 'characters');
  createUpdatedAtTrigger(db, 'character_relationships');
  createUpdatedAtTrigger(db, 'decisions');
  createUpdatedAtTrigger(db, 'questions');
  createUpdatedAtTrigger(db, 'living_documents');
  createUpdatedAtTrigger(db, 'timeline_events');
  createUpdatedAtTrigger(db, 'canon_tags');
  createUpdatedAtTrigger(db, 'entity_links');
  createUpdatedAtTrigger(db, 'context_packs');
  createUpdatedAtTrigger(db, 'ai_sessions');
  createUpdatedAtTrigger(db, 'candidates');
  createUpdatedAtTrigger(db, 'import_sessions');
  createUpdatedAtTrigger(db, 'editorial_extractions');
  createUpdatedAtTrigger(db, 'possible_duplicate_links');
  createUpdatedAtTrigger(db, 'continuity_review_items');
  createUpdatedAtTrigger(db, 'narrative_fragments');

  ensureColumn(db, 'characters', 'canon_state', "TEXT DEFAULT 'developing'");
  ensureColumn(db, 'ai_sessions', 'provider', 'TEXT');
  ensureColumn(db, 'ai_sessions', 'model', 'TEXT');
  ensureColumn(db, 'ai_sessions', 'prompt', 'TEXT');
  ensureColumn(db, 'ai_sessions', 'response', 'TEXT');
  ensureColumn(db, 'ai_sessions', 'template_id', 'TEXT');
  ensureColumn(db, 'ai_sessions', 'user_instructions', 'TEXT');
  ensureColumn(db, 'ai_sessions', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  ensureColumn(db, 'candidates', 'provenance_metadata', "TEXT DEFAULT '{}'");
  ensureColumn(db, 'candidates', 'suggested_links', "TEXT DEFAULT '[]'");
  ensureColumn(db, 'candidates', 'notes', "TEXT DEFAULT ''");
  ensureColumn(db, 'candidates', 'updated_at', 'DATETIME DEFAULT CURRENT_TIMESTAMP');
  ensureColumn(db, 'decisions', 'final_decision', 'TEXT');
  ensureColumn(db, 'decisions', 'rationale', 'TEXT');
  ensureColumn(db, 'decisions', 'resolution_notes', 'TEXT');
  ensureColumn(db, 'decisions', 'resolution_history', "TEXT DEFAULT '[]'");
  ensureColumn(db, 'questions', 'final_answer', 'TEXT');
  ensureColumn(db, 'questions', 'rationale', 'TEXT');
  ensureColumn(db, 'questions', 'resolution_notes', 'TEXT');
  ensureColumn(db, 'questions', 'resolution_history', "TEXT DEFAULT '[]'");
  ensureColumn(db, 'candidates', 'provenance_metadata', "TEXT DEFAULT '{}'");
}

function createUpdatedAtTrigger(db, tableName) {
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS ${tableName}_updated_at
    AFTER UPDATE ON ${tableName}
    FOR EACH ROW
    WHEN NEW.updated_at = OLD.updated_at
    BEGIN
      UPDATE ${tableName} SET updated_at = CURRENT_TIMESTAMP WHERE rowid = NEW.rowid;
    END;
  `);
}

function ensureColumn(db, tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  if (columns.some((column) => column.name === columnName)) return;

  db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
}
