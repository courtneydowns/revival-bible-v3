const entityTypeOrder = [
  'character',
  'episode',
  'decision',
  'question',
  'living_document',
  'bible_section'
];

const entityTypeLabels = {
  bible_section: 'Story Bible',
  character: 'Characters',
  decision: 'Decisions',
  episode: 'Episodes',
  living_document: 'Living Documents',
  question: 'Questions'
};

export const sessionPromptTemplates = [
  {
    id: 'writing-session',
    label: 'Writing Session',
    builtIn: true,
    instructions: [
      'Use this context to prepare a focused writing session.',
      'Prioritize scene goals, emotional continuity, character stakes, and unresolved decisions.',
      'Call out useful canon constraints before drafting or outlining.'
    ].join('\n')
  },
  {
    id: 'continuity-check',
    label: 'Continuity Check',
    builtIn: true,
    instructions: [
      'Review this context for continuity risks.',
      'Identify timeline, character, decision, relationship, and canon-state conflicts.',
      'Separate confirmed issues from questions that need human review.'
    ].join('\n')
  },
  {
    id: 'character-voice-pass',
    label: 'Character Voice Pass',
    builtIn: true,
    instructions: [
      'Use this context to check character voice and behavior.',
      'Focus on motives, wounds, recurring language, relational pressure, and emotional consistency.',
      'Flag any moment where a character sounds or acts outside the supplied canon.'
    ].join('\n')
  },
  {
    id: 'episode-planning',
    label: 'Episode Planning',
    builtIn: true,
    instructions: [
      'Use this context to plan episode structure.',
      'Track story turns, thematic pressure, continuity dependencies, and open questions.',
      'Keep suggestions compatible with locked canon and the current episode/season shape.'
    ].join('\n')
  },
  {
    id: 'contradiction-review',
    label: 'Contradiction Review',
    builtIn: true,
    instructions: [
      'Review this context for contradictions and unresolved tensions.',
      'List direct conflicts, soft conflicts, missing bridge logic, and records that need clarification.',
      'Do not invent new canon to resolve a contradiction.'
    ].join('\n')
  }
];

export function getSessionPromptTemplate(templateId, templates = sessionPromptTemplates) {
  return templates.find((template) => template.id === templateId) || templates[0] || sessionPromptTemplates[0];
}

export function assembleContextPackPrompt({ sessionContext = '', templateId = '', templates = sessionPromptTemplates } = {}) {
  const template = getSessionPromptTemplate(templateId, templates);

  return [
    '# Prompt Template',
    '',
    `## ${template.label}`,
    template.instructions,
    '',
    '# Generated Session Context',
    '',
    sessionContext
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export function assembleContextPackSessionContext({
  entityLinksByKey = {},
  entityTagsByKey = {},
  links = [],
  recordsByType = {},
  title = '',
  purpose = ''
} = {}) {
  const lines = [
    `# ${clean(title) || 'Untitled Context Pack'}`,
    '',
    `Purpose: ${clean(purpose) || 'No purpose notes provided.'}`,
    `Included records: ${links.length}`,
    ''
  ];

  for (const entityType of entityTypeOrder) {
    const group = links.filter((link) => link.entity_type === entityType);
    if (!group.length) continue;

    lines.push(`## ${entityTypeLabels[entityType] || formatLabel(entityType)}`);

    for (const link of group) {
      const record = findRecord(recordsByType[entityType], link.entity_id);
      const fields = getContextFields(entityType, record, link);
      const tags = entityTagsByKey[`${entityType}:${link.entity_id}`] || [];
      const references = entityLinksByKey[`${entityType}:${link.entity_id}`] || [];

      lines.push('', `### ${fields.title}`);
      pushLine(lines, 'Type', fields.type);
      pushLine(lines, 'Status', fields.status);
      pushLine(lines, 'Tags', tags.map((tag) => tag.label || tag.slug).filter(Boolean).join(', '));
      pushLine(lines, 'Summary', fields.summary);
      pushLine(lines, 'Description', fields.description);
      pushLine(lines, 'Pack reference', link.section);
      pushLine(lines, 'Linked records', formatReferences(references));
    }

    lines.push('');
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function findRecord(records = [], id) {
  return records.find((record) => String(record.id) === String(id)) || null;
}

function getContextFields(entityType, record, link) {
  if (!record) {
    return {
      title: clean(link.title) || 'Missing record',
      type: formatEntityType(entityType),
      status: link.missing ? 'Missing' : '',
      summary: '',
      description: ''
    };
  }

  switch (entityType) {
    case 'character':
      return {
        title: clean(record.name),
        type: record.role || 'Character',
        status: record.canon_state || record.status_at_open,
        summary: compact([record.role, record.status_at_open && `Open: ${record.status_at_open}`]),
        description: compact([record.arc_season_1, record.what_they_carry, record.notes])
      };
    case 'episode':
      return {
        title: `S${record.season}E${record.episode_number} ${clean(record.title)}`,
        type: 'Episode',
        status: record.status,
        summary: record.arc_summary || record.thematic_core,
        description: compact([record.thematic_core, record.na_tradition && `NA tradition: ${record.na_tradition}`, record.dual_meaning])
      };
    case 'decision':
      return {
        title: `#${record.sequence_number} ${clean(record.title)}`,
        type: `Decision Tier ${record.tier}`,
        status: record.status,
        summary: record.answer || record.what_needs_deciding,
        description: compact([record.question, record.what_we_know, record.why_first])
      };
    case 'question':
      return {
        title: clean(record.question),
        type: `Question / ${formatLabel(record.urgency)}`,
        status: record.status,
        summary: record.answer || 'Answer pending.',
        description: record.context
      };
    case 'living_document':
      return {
        title: `${formatDocType(record.doc_type)} Entry ${record.entry_number || record.id}`,
        type: formatDocType(record.doc_type),
        status: record.status,
        summary: summarizeLivingFields(record.fields),
        description: ''
      };
    case 'bible_section':
      return {
        title: clean(record.title),
        type: record.node_type || 'Story Bible',
        status: record.status,
        summary: summarizeMetadata(record.metadata),
        description: ''
      };
    default:
      return {
        title: clean(link.title),
        type: formatEntityType(entityType),
        status: record.status,
        summary: '',
        description: ''
      };
  }
}

function pushLine(lines, label, value) {
  const text = clean(value);
  if (text) lines.push(`- ${label}: ${text}`);
}

function compact(parts) {
  return parts.map(clean).filter(Boolean).join(' / ');
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function formatReferences(references) {
  return references
    .filter((reference) => !reference.target_missing)
    .slice(0, 6)
    .map((reference) => {
      const relationship = formatLabel(reference.relationship_type);
      return `${relationship}: ${formatEntityType(reference.related_type)} - ${reference.related_title}`;
    })
    .join('; ');
}

function summarizeLivingFields(fields) {
  const parsed = parseJson(fields);
  return Object.entries(parsed)
    .slice(0, 4)
    .map(([key, value]) => `${formatLabel(key)}: ${clean(value)}`)
    .filter((line) => !line.endsWith(':'))
    .join(' / ');
}

function summarizeMetadata(metadata) {
  const parsed = parseJson(metadata);
  return Object.entries(parsed)
    .slice(0, 4)
    .map(([key, value]) => `${formatLabel(key)}: ${clean(value)}`)
    .filter((line) => !line.endsWith(':'))
    .join(' / ');
}

function parseJson(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function formatDocType(docType) {
  const labels = {
    caroline_map: 'Caroline Logic Map',
    dread_map: 'Dread Map',
    obligation_ledger: 'Obligation Ledger',
    rewatch_ledger: 'Rewatch Ledger'
  };

  return labels[docType] || formatLabel(docType);
}

function formatEntityType(entityType) {
  const singular = {
    bible_section: 'Story Bible',
    character: 'Character',
    decision: 'Decision',
    episode: 'Episode',
    living_document: 'Living Document',
    question: 'Question',
    timeline_event: 'Timeline'
  };

  return singular[entityType] || formatLabel(entityType);
}

function formatLabel(value) {
  return String(value || '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
