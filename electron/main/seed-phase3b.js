import { seedDecisionsIfNeeded, seedLivingDocumentsIfNeeded, seedQuestionsIfNeeded } from './db.js';

const decisionSeeds = [
  decision(15, 1, "The Series' One Buried Truth", [], [1, 12]),
  decision(1, 1, 'The Last Image of the Series', [15], [2, 4]),
  decision(2, 2, "Megan's Choice", [1], [8, 12]),
  decision(4, 2, "Caroline's Complete Argument", [1], [6, 13]),
  decision(3, 3, 'What It Feels Like to Be Infected', [2, 4], [7, 14]),
  decision(7, 3, "Jordan's Moment of Clarity", [3], [10, 11]),
  decision(5, 3, 'What Happens to Diane', [3], [8]),
  decision(6, 4, 'The Caroline Reveal Episode Number', [4], [13]),
  decision(9, 4, 'The Nature of the Three-Way Relationship', [2], [10, 12]),
  decision(8, 5, 'Does Megan Call It In From the Parking Lot', [2, 5], []),
  decision(10, 5, "What Is in Jordan's Step 4", [7, 9], []),
  decision(11, 5, 'What Is the Text and Who Sent It', [7], []),
  decision(12, 5, "What Is Megan's Share in Scene 1", [15, 9], []),
  decision(13, 5, "What Does the Camera See That Megan Doesn't", [4, 6], []),
  decision(14, 5, 'Who Is the Patient on the First Narcan Call', [3], [])
];

const questionSeeds = [
  question(
    "What does Megan know in Episode 1 Scene 1 that she doesn't know she knows — and what will she know by Episode 24 that changes what that first knowledge meant?",
    'pinned'
  ),
  ...[
    'What is the last image of the series?',
    "What is Megan's choice?",
    'What does it feel like to be infected?',
    "What is Caroline's complete argument and is any of it correct?",
    'What specifically happens to Diane between the parking lot and S1 end?',
    'What is the Caroline reveal episode — specific number?',
    'Does Jordan have a moment of clarity?',
    'Does Megan call it in from the parking lot?',
    'What is the specific nature of the Diane / Megan / Jordan relationship?',
    "What is in Jordan's Step 4?",
    'What is the text in Scene 4 and who sent it?',
    'What does Megan share in Scene 1?',
    "What does the camera see that Megan doesn't — in the pilot?",
    'Who is the patient on the first Narcan call?',
    "What is the series' one buried truth?"
  ].map((text) => question(text, 'tier1')),
  ...[
    'Episode titles for all 24 episodes — with NA tradition anchors',
    'The cure — does it exist and if so what are its mechanics',
    'What is the Caroline Dossier — the 2019 paper and full internal logic',
    'What is the Season 1 finale image',
    'What is the Season 2 finale image',
    'All character end states - all three season boundaries',
    'The national spread mechanism - supply, travel, secondary, or combination',
    'Who is hunting Megan in Season 2 and through what institutional mechanisms',
    'The three season boundary documents — what happened in the gaps',
    'The harm reduction worker — name, full role, their own relationship to the work',
    'Huntington WV or fictional equivalent — commit',
    'The law enforcement character — name, role, arc across three seasons',
    'The hospital character — name, role, the specific triage decisions they make',
    'The federal antagonist - who they are and what they represent',
    'The recovery community regular - who they are and what they read in Jordan'
  ].map((text) => question(text, 'tier2')),
  ...[
    'The Caroline monologue — does she get one and who is in the room',
    'Whether Revival uses structural non-linearity and the governing principle',
    'The drift prevention protocols — full document',
    'The violence policy — shown, implied, never shown',
    'The addiction depiction policy - how active use is depicted',
    "What the transitioned person is — the full rules the writers' room needs",
    'Secondary transmission - does it exist and what is its mechanism',
    'Whether the virus affects animals',
    'Individual variation in the 72-hour window',
    "Jordan's Season 2 and 3 presence — findable, does Megan look, encounter meaning",
    "Diane's Season 2 and 3 presence — same questions",
    "What Megan's sponsor above Diane looks like — does this character appear",
    'Whether Caroline has collaborators or acted alone',
    'The score — instruments, what it does not do, whether it changes across seasons',
    "Megan's using history — what she used, how long, what it cost, what got her sober",
    "Ray's family — who specifically he is protecting when he withdraws",
    "Jordan's family — who are his people, are they present",
    "Diane's relapse trigger — the specific event or accumulation"
  ].map((text) => question(text, 'tier3'))
];

const livingDocumentSeeds = [
  livingDocument('rewatch_ledger', 1, {
    episode: 'S1E1',
    scene: "Jordan's first visible transition markers",
    first_watch: 'Reads as early recovery, exhaustion, or relapse-adjacent behavior.',
    rewatch: 'Reveals Jordan was already infected before the audience understood the rules.',
    information_that_changes_reading: 'Jordan was revived six weeks before the pilot.',
    character_knows_truth: 'No',
    cinematic_element: 'Pupil response anomaly, played subtly.'
  }),
  livingDocument('dread_map', 1, {
    episode: 'S1E1',
    baseline: 'The world appears routine: meetings, EMS calls, recovery language, Narcan saves.',
    accumulates: "Small wrongness around revived bodies and Jordan's behavior.",
    unresolved: 'What is wrong with the revived?',
    mechanism: 'Misreading — signs are interpreted through addiction assumptions.',
    unsaid: 'The thing saving people may also be changing them.',
    crystallizes: 'The parking lot revival reframes care as danger.',
    false_release: 'The patient wakes up; everyone treats survival as success.'
  }),
  livingDocument('obligation_ledger', 1, {
    character: 'Megan Chase',
    promise: 'If someone can be saved, Megan shows up.',
    established_when: 'Pilot / EMS calls / recovery community.',
    honored_or_broken: 'Pending.',
    cost_or_earned: "Her competence becomes the outbreak's architecture."
  }),
  livingDocument('caroline_map', 1, {
    episode: 'S1E1',
    scene: "Framework placeholder — Caroline's unseen pre-pilot logic.",
    apparent_action: 'Not yet visible to the audience.',
    actual_action: 'The exposure network already exists before Megan understands it.',
    information_extracted: 'Names, revivals, proximity, recovery network connections.',
    endgame_served: 'Maps the community through the people trying to save it.'
  })
];

export function seedPhase3B() {
  return {
    decisions: seedDecisionsIfNeeded(decisionSeeds),
    questions: seedQuestionsIfNeeded(questionSeeds),
    livingDocuments: seedLivingDocumentsIfNeeded(livingDocumentSeeds)
  };
}

function decision(sequence_number, tier, title, blockedBy, blocks) {
  return {
    tier,
    sequence_number,
    title,
    question: title,
    why_first: 'This decision affects downstream story, pilot, or season architecture.',
    what_we_know: 'Known context pending.',
    what_needs_deciding: 'Answer pending.',
    answer: '',
    status: 'needed',
    blocks: JSON.stringify(blocks),
    blocked_by: JSON.stringify(blockedBy),
    locked_at: null
  };
}

function question(text, urgency) {
  return {
    question: text,
    urgency,
    status: 'open',
    answer: '',
    context: '',
    blocks: '[]',
    blocked_by: '[]'
  };
}

function livingDocument(docType, entryNumber, fields) {
  return {
    doc_type: docType,
    entry_number: entryNumber,
    fields: JSON.stringify(fields),
    status: 'DEVELOPING'
  };
}
