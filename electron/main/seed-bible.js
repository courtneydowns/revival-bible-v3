import { seedBibleIfEmpty } from './db.js';

const sections = [
  section('section-01', 'SECTION 1: PREMISE', 1, [
    child('section-01-01', '1.1 Logline', 'LOCKED'),
    child('section-01-02', '1.2 Format', 'LOCKED'),
    child('section-01-03', '1.3 Series Argument', 'LOCKED'),
    child('section-01-04', '1.4 The Three Season Arguments', 'LOCKED'),
    child('section-01-05', '1.5 The Central Question', 'LOCKED'),
    child('section-01-06', '1.6 Tone and Register', 'LOCKED'),
    child('section-01-07', '1.7 What This Show Is Not', 'LOCKED')
  ]),
  section('section-02', 'SECTION 2: SERIES DNA', 2, [
    child('section-02-01', "2.1 The Show's DNA Statement", 'ESTABLISHED'),
    child('section-02-02', '2.2 The Haunting Principle', 'LOCKED'),
    child('section-02-03', '2.3 The Emotional Promise', 'ESTABLISHED'),
    child('section-02-04', '2.4 The Buried Truth', 'NEEDED'),
    child('section-02-05', "2.5 The Show's Relationship With Hope", 'ESTABLISHED'),
    child('section-02-06', '2.6 What Redemption Means in This Show', 'ESTABLISHED'),
    child('section-02-07', '2.7 Comparable Titles', 'ESTABLISHED')
  ]),
  section('section-03', 'SECTION 3: CHARACTERS', 3, [
    child('section-03-01', '3.1 Series Regulars', 'DEVELOPING'),
    child('section-03-02', '3.2 Recurring Characters', 'DEVELOPING'),
    child('section-03-03', '3.3 Character Relationship Map', 'DEVELOPING'),
    child('section-03-04', '3.4 Character Voice Distinctions', 'DEVELOPING'),
    child('section-03-05', '3.5 What Each Character Would Never Say', 'DEVELOPING')
  ]),
  section('section-04', 'SECTION 4: RECOVERY', 4, [
    child('section-04-01', '4.1 Authenticity Authority', 'LOCKED'),
    child('section-04-02', '4.2 NA Culture and Authenticity', 'ESTABLISHED'),
    child('section-04-03', '4.3 The Sponsorship Chain', 'DEVELOPING'),
    child("section-04-04", "4.4 The Recovery Community's Three-Season Arc", 'DEVELOPING'),
    child("section-04-05", "4.5 What This Show Gets Right That Other Addiction Narratives Don't", 'ESTABLISHED')
  ]),
  section('section-05', 'SECTION 5: VIRUS', 5, [
    child('section-05-01', '5.1 The Core Mechanism', 'ESTABLISHED'),
    child('section-05-02', '5.2 The Virus Rules', 'DEVELOPING'),
    child('section-05-03', '5.3 Phase-by-Phase Progression', 'DEVELOPING'),
    child('section-05-04', '5.4 The Reversal Window', 'LOCKED'),
    child('section-05-05', '5.5 Physical Markers', 'LOCKED'),
    child('section-05-06', '5.6 The Infected as People', 'ESTABLISHED'),
    child('section-05-07', '5.7 The Cure', 'DEVELOPING'),
    child('section-05-08', '5.8 The Contaminated Supply Chain', 'DEVELOPING'),
    child('section-05-09', '5.9 What the Show Does Not Answer', 'ESTABLISHED')
  ]),
  section('section-06', 'SECTION 6: WORLD', 6, [
    child('section-06-01', '6.1 The Rust Belt City', 'DEVELOPING'),
    child('section-06-02', '6.2 The National Scale - Season 2', 'DEVELOPING'),
    child('section-06-03', '6.3 The Aftermath Geography - Season 3', 'DEVELOPING'),
    child('section-06-04', '6.4 Institutions and How Each Becomes a Vector', 'ESTABLISHED'),
    child('section-06-05', '6.5 The Economy of Who Gets Saved', 'ESTABLISHED')
  ]),
  section('section-07', 'SECTION 7: THEMES', 7, [
    child('section-07-01', '7.1 The Core Question', 'LOCKED'),
    child('section-07-02', '7.2 Thematic Architecture by Season', 'LOCKED'),
    child('section-07-03', '7.3 Thematic Territories - Full Development', 'DEVELOPING'),
    child('section-07-04', '7.4 The Complicity Spectrum', 'DEVELOPING'),
    child('section-07-05', '7.5 How Theme Arrives', 'LOCKED'),
    child('section-07-06', '7.6 What the Show Does Not Do', 'LOCKED')
  ]),
  section('section-08', 'SECTION 8: PILOT', 8, [
    child('section-08-01', '8.1 Episode 1 Title', 'LOCKED'),
    child('section-08-02', '8.2 The Five-Scene Breakdown', 'ESTABLISHED'),
    child('section-08-03', '8.3 The Pilot as Series Contract', 'ESTABLISHED')
  ]),
  section('section-09', 'SECTION 9: SEASON ARCS', 9, [
    child('section-09-01', '9.1 Season 1 - Diagnosis', 'ESTABLISHED'),
    child('section-09-02', '9.2 Season 2 - Confrontation', 'ESTABLISHED'),
    child('section-09-03', '9.3 Season 3 - Consequence', 'ESTABLISHED'),
    child('section-09-04', '9.4 The Season Boundary Documents', 'DEVELOPING'),
    child('section-09-05', '9.5 The 24-Episode Tracking Sheet', 'NEEDED'),
    child('section-09-06', '9.6 The Thematic Throughline Document', 'NEEDED')
  ]),
  section('section-10', 'SECTION 10: EPISODE ARCHITECTURE', 10, [
    child('section-10-01', '10.1 Standard Episode Structure', 'ESTABLISHED'),
    child('section-10-02', '10.2 The Cold Open', 'ESTABLISHED'),
    child('section-10-03', '10.3 The Flanagan Moment', 'ESTABLISHED'),
    child('section-10-04', '10.4 The Meeting Scene Function', 'ESTABLISHED'),
    child('section-10-05', '10.5 Episode Title Logic', 'ESTABLISHED')
  ]),
  section('section-11', 'SECTION 11: INDUSTRY', 11, [
    child('section-11-01', '11.1 Industry Path', 'LOCKED'),
    child('section-11-02', '11.2 Format Positioning', 'LOCKED'),
    child('section-11-03', '11.3 Platform Considerations', 'DEVELOPING'),
    child("section-11-04", "11.4 The Why Now Document", 'DEVELOPING'),
    child("section-11-05", "11.5 The Showrunner's Statement", 'DEVELOPING'),
    child('section-11-06', '11.6 Sensitivity and Clearance Considerations', 'DEVELOPING')
  ]),
  section('section-12', 'SECTION 12: CRAFT PRINCIPLES - THE FLANAGAN METHOD', 12, [
    child('section-12-01', '12.1 The Core Principle', 'LOCKED'),
    child('section-12-02', '12.2 The Rewatch Architecture', 'ESTABLISHED'),
    child('section-12-03', '12.3 The Rewatch Ledger', 'DEVELOPING'),
    child('section-12-04', '12.4 The Long Burn - Dread Accumulation', 'ESTABLISHED'),
    child('section-12-05', '12.5 Emotional Resolution Without Literal Resolution', 'LOCKED'),
    child('section-12-06', '12.6 The Flanagan Family Dynamic', 'ESTABLISHED'),
    child('section-12-07', '12.7 The Monster Is Never Wrong - The Caroline Principle', 'ESTABLISHED'),
    child('section-12-08', '12.8 The Flanagan Negative Principles', 'LOCKED'),
    child('section-12-09', '12.9 The Three Questions Every Episode Must Answer', 'LOCKED'),
    child('section-12-10', '12.10 The Flanagan Monologue Principle', 'ESTABLISHED'),
    child('section-12-11', '12.11 The Long Take Principle', 'ESTABLISHED'),
    child('section-12-12', '12.12 The Flanagan Time Principle', 'ESTABLISHED'),
    child('section-12-13', '12.13 Tonal Calibration - The Center and Its Edges', 'ESTABLISHED')
  ]),
  section('section-13', 'SECTION 13: WORKING DOCUMENTS', 13, [
    child('section-13-01', '13.1 The Pivot Inventory', 'DEVELOPING'),
    child('section-13-02', '13.2 The Misreading Engine Document', 'DEVELOPING'),
    child('section-13-03', '13.3 The Continuity Document', 'DEVELOPING'),
    child('section-13-04', '13.4 The Outbreak Timeline', 'DEVELOPING'),
    child('section-13-05', '13.5 The Character Knowledge States Document', 'DEVELOPING'),
    child('section-13-06', '13.6 The Dread Accumulation Map', 'DEVELOPING'),
    child('section-13-07', '13.7 The Questions Log', 'DEVELOPING'),
    child('section-13-08', '13.8 The Session Log', 'DEVELOPING')
  ]),
  section('section-14', 'SECTION 14: PRODUCTION', 14, [
    child('section-14-01', '14.1 Visual Language', 'DEVELOPING'),
    child('section-14-02', '14.2 Sound Design', 'DEVELOPING'),
    child('section-14-03', '14.3 The Pilot Production Requirements', 'DEVELOPING'),
    child('section-14-04', '14.4 Casting Considerations', 'DEVELOPING'),
    child('section-14-05', '14.5 The Medical Accuracy Consultant Brief', 'DEVELOPING')
  ]),
  section('section-15', 'SECTION 15: PRE-WRITING DECISIONS', 15, [
    child('section-15-01', '15.1 Decision System Overview', 'NEEDED')
  ]),
  section('section-16', 'SECTION 16: RESEARCH DOCUMENTS', 16, [
    child('section-16-01', '16.1 Medical and Biological', 'DEVELOPING'),
    child('section-16-02', '16.2 NA Accuracy', 'DEVELOPING'),
    child('section-16-03', '16.3 EMS Culture', 'DEVELOPING'),
    child('section-16-04', '16.4 CDC Investigative Protocol', 'DEVELOPING'),
    child('section-16-05', '16.5 Harm Reduction Site Operations', 'DEVELOPING'),
    child('section-16-06', '16.6 The Rust Belt', 'DEVELOPING'),
    child('section-16-07', '16.7 Source Material and Influence', 'DEVELOPING')
  ]),
  section('section-17', 'SECTION 17: APPENDICES', 17, [
    child('section-17-01', '17.1 Anti-Exploitation Checklist', 'DEVELOPING', 'appendix'),
    child('section-17-02', '17.2 Violence and Depiction Policy', 'DEVELOPING', 'appendix'),
    child('section-17-03', '17.3 Consultant List', 'DEVELOPING', 'appendix'),
    child('section-17-04', '17.4 The Negative Space Document', 'DEVELOPING', 'appendix'),
    child('section-17-05', '17.5 The World After', 'DEVELOPING', 'appendix'),
    child('section-17-06', '17.6 The DNA Statement', 'LOCKED', 'appendix')
  ])
];

const contentByNodeId = {
  'section-01-01': 'A newly sober paramedic in a rust belt city becomes the unknowing architect of a viral outbreak when the Narcan she administers activates a transformative virus engineered into the heroin supply.',
  'section-01-02': '3 seasons. 8 episodes each. 24 episodes total. Hard stop.',
  'section-01-04': 'Season 1 - Diagnosis: What is already wrong.\n\nSeason 2 - Confrontation: What happens when it can no longer be ignored.\n\nSeason 3 - Consequence: What we build in the aftermath and whether it is any different.',
  'section-01-05': 'Did we ever actually want to save these people?',
  'section-05-04': 'The reversal window is locked as a core virus rule. Phase 2 records the heading and locked status; full operational detail remains in the story source for later structured seeding.',
  'section-05-05': 'Physical markers are locked as an observable sign system for infection and recovery-state misreading. Full marker taxonomy will be expanded in a later phase.',
  'section-07-01': 'Did we ever actually want to save these people?',
  'section-07-02': 'Season 1 - Diagnosis: What is already wrong.\n\nSeason 2 - Confrontation: What happens when it can no longer be ignored.\n\nSeason 3 - Consequence: What we build in the aftermath and whether it is any different.',
  'section-08-01': 'Episode 1 title is locked in the story bible source. Phase 2 preserves the node and status without importing the full episode architecture.',
  'section-08-02': 'The pilot uses a five-scene breakdown as its series contract. Phase 2 keeps this read-only placeholder until episode seeding begins.',
  'section-09-01': 'Season 1 - Diagnosis: What is already wrong.',
  'section-09-02': 'Season 2 - Confrontation: What happens when it can no longer be ignored.',
  'section-09-03': 'Season 3 - Consequence: What we build in the aftermath and whether it is any different.',
  'section-12-01': 'The core craft principle is that horror externalizes emotional truth. The supernatural event must reveal the human wound rather than replace it.',
  'section-12-02': 'Rewatch architecture means later knowledge changes the meaning of earlier scenes. Phase 2 seeds the framework; the ledger becomes structured data later.',
  'section-12-05': 'Emotional resolution does not require literal resolution. Characters can arrive at truth, mercy, or consequence while the world remains wounded.',
  'section-12-07': "The monster is never wrong: Caroline's logic must remain legible, specific, and emotionally dangerous even when her actions are monstrous.",
  'section-12-08': 'Negative principles: do not use horror as decoration, addiction as spectacle, recovery as sermon, or mystery as a substitute for character truth.'
};

const characters = [
  { name: 'Megan Chase', role: 'Series Regular', status_at_open: 'Alive', position: 1 },
  { name: 'Diane', role: 'Series Regular', status_at_open: 'Alive', position: 2 },
  { name: 'Jordan', role: 'Series Regular', status_at_open: 'Alive', position: 3 },
  { name: 'Dr. Caroline Marsh', role: 'Series Regular', status_at_open: 'Alive', position: 4 },
  { name: 'Ray', role: 'Series Regular', status_at_open: 'Alive', position: 5 },
  { name: 'The Harm Reduction Worker', role: 'Recurring', status_at_open: 'Alive', position: 6 }
];

const relationships = [
  relation('Diane', 'Megan Chase', 'recovery', 'Sponsor/sponsee - 19 years / 9 months'),
  relation('Megan Chase', 'Jordan', 'recovery', 'Sponsor/sponsee - relationship nature pending Decision #9'),
  relation('Megan Chase', 'Ray', 'professional', 'EMS partners'),
  relation('Megan Chase', 'Dr. Caroline Marsh', 'antagonist', "Unknowing architect / hunter - Caroline maps Megan's network"),
  relation('Jordan', 'Diane', 'recovery', "Sponsee's sponsor's sponsor - indirect recovery chain"),
  relation('Megan Chase', 'Diane', 'family', 'Surrogate family; Megan revives Diane in the parking lot'),
  relation('Megan Chase', 'Jordan', 'knowledge', 'Megan will learn to read the markers Jordan already carries'),
  relation('Dr. Caroline Marsh', 'Jordan', 'infection', "Caroline's network map includes Jordan; he was revived 6 weeks before pilot"),
  relation('Dr. Caroline Marsh', 'Diane', 'infection', "Diane infected via Megan's revival; Caroline's collected names include Diane")
];

export function seedBible() {
  return seedBibleIfEmpty({
    nodes: flattenNodes(sections),
    contents: flattenNodes(sections).map((node) => ({
      id: `content-${node.id}-phase-2`,
      node_id: node.id,
      content: contentByNodeId[node.id] || defaultContent(node),
      version: 1,
      session_origin: 'phase_2_seed'
    })),
    characters,
    relationships
  });
}

function section(id, title, position, children) {
  return {
    id,
    parent_id: null,
    title,
    node_type: 'section',
    position,
    status: rollupStatus(children),
    metadata: { section: position },
    children
  };
}

function child(id, title, status, node_type = 'subsection') {
  return { id, title, status, node_type };
}

function relation(from, to, relationship_type, detail) {
  return { from, to, relationship_type, detail };
}

function flattenNodes(tree) {
  return tree.flatMap((parent) => [
    nodeRecord(parent),
    ...parent.children.map((node, index) => nodeRecord({
      ...node,
      parent_id: parent.id,
      position: index + 1,
      metadata: { parent: parent.title }
    }))
  ]);
}

function nodeRecord(node) {
  return {
    id: node.id,
    parent_id: node.parent_id || null,
    title: node.title,
    node_type: node.node_type,
    position: node.position,
    status: node.status,
    metadata: JSON.stringify(node.metadata || {})
  };
}

function rollupStatus(children) {
  if (children.some((node) => node.status === 'NEEDED')) return 'NEEDED';
  if (children.some((node) => node.status === 'DEVELOPING')) return 'DEVELOPING';
  if (children.every((node) => node.status === 'LOCKED')) return 'LOCKED';
  return 'ESTABLISHED';
}

function defaultContent(node) {
  if (node.status === 'NEEDED') {
    return 'Content needed. This section has been identified as required but is not yet populated.';
  }

  return `Content pending. Status: ${node.status}.`;
}
