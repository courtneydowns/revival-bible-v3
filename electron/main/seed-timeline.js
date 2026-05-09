import { seedTimelineEventsIfNeeded } from './db.js';

const timelineEvents = [
  event({
    seed_key: 'pre-pilot-contamination-origin',
    chronology_bucket: 'Pre-Pilot',
    outbreak_phase: 'Origin Unknown',
    event_type: 'canon_anchor',
    title: 'Contaminated Supply Chain Exists Before the Pilot',
    summary: 'The viral mechanism is already present in the heroin supply before Megan understands the pattern.',
    source_note: 'Seeded from existing premise and V4 contamination-origin guidance.',
    position: 1
  }),
  event({
    seed_key: 'pre-pilot-jordan-revived',
    chronology_bucket: 'Six Weeks Before Pilot',
    outbreak_phase: 'Early Infection',
    event_type: 'character_state',
    title: 'Jordan Is Revived Before the Pilot',
    summary: 'Jordan carries transition markers before the audience or Megan can correctly read them.',
    source_note: 'Seeded from existing relationship canon: Jordan was revived six weeks before pilot.',
    position: 2
  }),
  event({
    seed_key: 'pre-pilot-caroline-network-map',
    chronology_bucket: 'Pre-Pilot',
    outbreak_phase: 'Network Mapping',
    event_type: 'character_knowledge',
    title: 'Caroline Maps the Recovery Network',
    summary: "Caroline's logic map already includes names, revivals, proximity, and recovery-network connections.",
    source_note: 'Seeded from Phase 3B Caroline logic map and relationship canon.',
    position: 3
  }),
  event({
    seed_key: 's1e1-megan-meeting',
    season: 1,
    episode_number: 1,
    chronology_bucket: 'Pilot',
    outbreak_phase: 'Misreading',
    event_type: 'episode_anchor',
    title: 'Megan Begins in the Meeting World',
    summary: 'The pilot opens from recovery language and community before the outbreak is legible as outbreak.',
    source_note: 'Seeded from V4 pilot decision language and existing First Things First episode slot.',
    position: 4
  }),
  event({
    seed_key: 's1e1-first-narcan-call',
    season: 1,
    episode_number: 1,
    chronology_bucket: 'Pilot',
    outbreak_phase: 'First Observable Marker',
    event_type: 'medical_event',
    title: 'First Narcan Call Shows Something Wrong',
    summary: 'Megan revives a patient and observes signs that can be misread through routine overdose-response assumptions.',
    source_note: 'Seeded from V4 Decision 14 language and existing Narcan-call canon.',
    position: 5
  }),
  event({
    seed_key: 's1e1-diane-parking-lot',
    season: 1,
    episode_number: 1,
    chronology_bucket: 'Pilot',
    outbreak_phase: 'Known Exposure',
    event_type: 'turning_point',
    title: 'Megan Revives Diane in the Parking Lot',
    summary: "Diane's revival connects Megan's intimate recovery family to the outbreak mechanism.",
    source_note: 'Seeded from existing relationship canon and Phase 3B question/decision context.',
    position: 6
  }),
  event({
    seed_key: 'season-1-diagnosis',
    season: 1,
    chronology_bucket: 'Season 1',
    outbreak_phase: 'Diagnosis',
    event_type: 'season_arc',
    title: 'Season 1 Tracks What Is Already Wrong',
    summary: 'The local outbreak becomes increasingly legible while characters and institutions continue misreading it.',
    source_note: 'Seeded from locked three-season argument.',
    position: 7
  }),
  event({
    seed_key: 'season-2-confrontation',
    season: 2,
    chronology_bucket: 'Season 2',
    outbreak_phase: 'Confrontation',
    event_type: 'season_arc',
    title: 'Season 2 Tracks What Can No Longer Be Ignored',
    summary: 'The outbreak scale and institutional response move beyond local diagnosis into confrontation.',
    source_note: 'Seeded from locked three-season argument.',
    position: 8
  }),
  event({
    seed_key: 'season-3-consequence',
    season: 3,
    chronology_bucket: 'Season 3',
    outbreak_phase: 'Consequence',
    event_type: 'season_arc',
    title: 'Season 3 Tracks the Aftermath',
    summary: 'The story turns toward what gets built after the outbreak and whether it differs from what came before.',
    source_note: 'Seeded from locked three-season argument.',
    position: 9
  })
];

export function seedTimeline() {
  return seedTimelineEventsIfNeeded(timelineEvents);
}

function event(seed) {
  return {
    season: null,
    episode_number: null,
    status: 'DEVELOPING',
    ...seed
  };
}
