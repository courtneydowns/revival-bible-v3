import { seedCanonTagsIfNeeded } from './db.js';

const tags = [
  tag('canon', 'Canon', 'Authoritative story-bible material or seeded canon anchor.', 'canon'),
  tag('character', 'Character', 'Character-linked canon item.', 'character'),
  tag('timeline', 'Timeline', 'Chronology or outbreak timeline item.', 'timeline'),
  tag('location', 'Location', 'Place, institution, or geography-linked item.', 'location'),
  tag('episode', 'Episode', 'Episode-linked item.', 'episode'),
  tag('relationship', 'Relationship', 'Character relationship or network-linked item.', 'relationship'),
  tag('question', 'Question', 'Open creative question or question-log item.', 'question'),
  tag('decision', 'Decision', 'Pre-writing decision item.', 'decision'),
  tag('unresolved', 'Unresolved', 'Known open or developing canon area.', 'unresolved'),
  tag('contradiction-risk', 'Contradiction Risk', 'Canon area that should be watched for future continuity checks.', 'risk')
];

const links = [
  link('canon', 'character', { character: 'Megan Chase', note: 'Series spine and currently seeded central protagonist.' }),
  link('character', 'character', { character: 'Megan Chase' }),
  link('canon', 'character', { character: 'Jordan', note: 'Seeded as infected before the pilot via existing relationship canon.' }),
  link('character', 'character', { character: 'Jordan' }),
  link('contradiction-risk', 'character', { character: 'Jordan', note: 'Jordan sponsorship and infected subjective experience are still decision-linked.' }),
  link('relationship', 'character', { character: 'Dr. Caroline Marsh', note: 'Caroline maps the recovery network through character relationships.' }),
  link('unresolved', 'decision', { sequence_number: 6, note: 'Caroline reveal episode remains unresolved.' }),
  link('decision', 'decision', { sequence_number: 6 }),
  link('unresolved', 'decision', { sequence_number: 9, note: 'Diane / Megan / Jordan relationship specificity remains unresolved.' }),
  link('relationship', 'decision', { sequence_number: 9 }),
  link('question', 'question', { question: "What is the specific nature of the Diane / Megan / Jordan relationship?" }),
  link('relationship', 'question', { question: "What is the specific nature of the Diane / Megan / Jordan relationship?" }),
  link('timeline', 'timeline_event', { seed_key: 'pre-pilot-jordan-revived' }),
  link('character', 'timeline_event', { seed_key: 'pre-pilot-jordan-revived', note: 'Jordan timeline anchor.' }),
  link('timeline', 'timeline_event', { seed_key: 's1e1-diane-parking-lot' }),
  link('episode', 'timeline_event', { seed_key: 's1e1-diane-parking-lot', note: 'Pilot episode anchor.' }),
  link('location', 'timeline_event', { seed_key: 's1e1-diane-parking-lot', note: 'Parking lot is a seeded outbreak location anchor.' }),
  link('episode', 'episode', { season: 1, episode_number: 1, note: 'First Things First pilot slot.' }),
  link('canon', 'episode', { season: 1, episode_number: 1 }),
  link('timeline', 'living_document', { doc_type: 'dread_map', entry_number: 1 }),
  link('relationship', 'living_document', { doc_type: 'caroline_map', entry_number: 1 }),
  link('contradiction-risk', 'living_document', { doc_type: 'caroline_map', entry_number: 1, note: "Caroline's exact full argument remains decision-linked." })
];

export function seedCanonTags() {
  return seedCanonTagsIfNeeded({ tags, links });
}

function tag(slug, label, description, color) {
  return { slug, label, description, color };
}

function link(tagSlug, entityType, data = {}) {
  return { tag: tagSlug, entity_type: entityType, ...data };
}
