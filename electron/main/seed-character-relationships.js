import { seedCharacterRelationshipsIfNeeded } from './db.js';

const relationshipSeeds = [
  relationship(
    'Diane',
    'Megan Chase',
    'family',
    'Surrogate recovery family: Diane is the long-sober parent figure and Megan is the middle position.'
  ),
  relationship(
    'Megan Chase',
    'Jordan',
    'family',
    'Surrogate recovery family: Megan and Jordan carry the unresolved sponsor-chain question in Decision #9.'
  ),
  relationship(
    'Megan Chase',
    'Ray',
    'ally',
    'EMS partners; the ambulance is their mobile confessional and working trust space.'
  ),
  relationship(
    'Dr. Caroline Marsh',
    'Megan Chase',
    'authority',
    'Caroline appears to Megan as a trusted professional authority who believes what Megan is seeing.'
  ),
  relationship(
    'Dr. Caroline Marsh',
    'Megan Chase',
    'secret',
    "Caroline uses Megan's trust and recovery network knowledge to deepen the exposure map."
  ),
  relationship(
    'Dr. Caroline Marsh',
    'Jordan',
    'secret',
    "Caroline's network map includes Jordan before Megan can correctly read his transition markers."
  ),
  relationship(
    'Dr. Caroline Marsh',
    'Diane',
    'secret',
    "Caroline's collected names include Diane after Megan revives her in the parking lot."
  ),
  relationship(
    'Megan Chase',
    'Dr. Caroline Marsh',
    'conflict',
    "Unknowing architect and hunter: Megan's care network becomes part of Caroline's map."
  )
];

export function seedCharacterRelationshipRefinement() {
  return seedCharacterRelationshipsIfNeeded(relationshipSeeds);
}

function relationship(from, to, relationship_type, detail) {
  return { from, to, relationship_type, detail };
}
