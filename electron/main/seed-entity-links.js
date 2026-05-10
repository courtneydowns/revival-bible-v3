import { seedEntityLinksIfNeeded } from './db.js';

const links = [
  link('character', { name: 'Megan Chase' }, 'decision', { sequence_number: 2 }, 'depends_on', "Megan's choice is the central character decision spine."),
  link('character', { name: 'Megan Chase' }, 'decision', { sequence_number: 12 }, 'depends_on', "Megan's opening share depends on the buried-truth frame."),
  link('character', { name: 'Megan Chase' }, 'question', { question: "What does Megan know in Episode 1 Scene 1 that she doesn't know she knows — and what will she know by Episode 24 that changes what that first knowledge meant?" }, 'unresolved_question'),
  link('character', { name: 'Megan Chase' }, 'episode', { season: 1, episode_number: 1 }, 'appears_in', 'Pilot anchor.'),
  link('character', { name: 'Megan Chase' }, 'timeline_event', { seed_key: 's1e1-diane-parking-lot' }, 'witnesses', "Megan revives Diane in the pilot parking-lot turn."),
  link('character', { name: 'Diane' }, 'decision', { sequence_number: 9 }, 'depends_on', 'Relationship specificity is still pending.'),
  link('character', { name: 'Diane' }, 'timeline_event', { seed_key: 's1e1-diane-parking-lot' }, 'exposed_in', 'Diane is the intimate outbreak anchor in the parking lot.'),
  link('character', { name: 'Jordan' }, 'decision', { sequence_number: 3 }, 'contradiction_risk', "Jordan's pre-pilot state must stay consistent with infection subjectivity."),
  link('character', { name: 'Jordan' }, 'timeline_event', { seed_key: 'pre-pilot-jordan-revived' }, 'anchored_by', 'Jordan was revived six weeks before the pilot.'),
  link('character', { name: 'Dr. Caroline Marsh' }, 'decision', { sequence_number: 4 }, 'depends_on', "Caroline's argument governs how her network map should be read."),
  link('character', { name: 'Dr. Caroline Marsh' }, 'living_document', { doc_type: 'caroline_map', entry_number: 1 }, 'explained_by', 'First Caroline logic-map placeholder.'),
  link('decision', { sequence_number: 2 }, 'question', { question: "What is Megan's choice?" }, 'answers'),
  link('decision', { sequence_number: 3 }, 'question', { question: 'What does it feel like to be infected?' }, 'answers'),
  link('decision', { sequence_number: 4 }, 'question', { question: "What is Caroline's complete argument and is any of it correct?" }, 'answers'),
  link('decision', { sequence_number: 6 }, 'question', { question: 'What is the Caroline reveal episode — specific number?' }, 'answers'),
  link('decision', { sequence_number: 9 }, 'question', { question: 'What is the specific nature of the Diane / Megan / Jordan relationship?' }, 'answers'),
  link('decision', { sequence_number: 14 }, 'timeline_event', { seed_key: 's1e1-first-narcan-call' }, 'contradiction_risk', 'The first Narcan call has to stay aligned with pilot medical-observation canon.'),
  link('episode', { season: 1, episode_number: 1 }, 'timeline_event', { seed_key: 's1e1-megan-meeting' }, 'contains'),
  link('episode', { season: 1, episode_number: 1 }, 'timeline_event', { seed_key: 's1e1-first-narcan-call' }, 'contains'),
  link('episode', { season: 1, episode_number: 1 }, 'living_document', { doc_type: 'rewatch_ledger', entry_number: 1 }, 'tracked_by')
];

export function seedEntityLinks() {
  return seedEntityLinksIfNeeded(links);
}

function link(sourceType, source, targetType, target, relationshipType, note = '') {
  return {
    source_type: sourceType,
    source,
    target_type: targetType,
    target,
    relationship_type: relationshipType,
    note
  };
}
