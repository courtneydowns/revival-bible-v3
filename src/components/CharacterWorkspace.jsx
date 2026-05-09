import { useEffect } from 'react';
import { useRevivalStore } from '../store.js';

export default function CharacterWorkspace() {
  const activeCharacterId = useRevivalStore((state) => state.activeCharacterId);
  const characters = useRevivalStore((state) => state.characters);
  const selectedCharacter = useRevivalStore((state) => state.selectedCharacter);
  const relationships = useRevivalStore((state) => state.selectedCharacterRelationships);
  const selectCharacter = useRevivalStore((state) => state.selectCharacter);

  useEffect(() => {
    if (!activeCharacterId && characters.length) {
      selectCharacter(characters[0].id);
    }
  }, [activeCharacterId, characters, selectCharacter]);

  return (
    <section className="view character-workspace">
      <div className="eyebrow">Characters / Read Only</div>
      <h1>Character Workspace</h1>
      <div className="split-view character-split-view">
        <aside className="list-panel character-list-panel">
          {characters.map((character) => (
            <button
              className={`list-row ${String(activeCharacterId) === String(character.id) ? 'selected' : ''}`}
              key={character.id}
              onClick={() => selectCharacter(character.id)}
              type="button"
            >
              <strong>{character.name}</strong>
              <span>{character.role}</span>
            </button>
          ))}
        </aside>
        <article className={`detail-panel character-detail-panel ${selectedCharacter ? 'selected-detail-panel' : ''}`}>
          {selectedCharacter ? (
            <>
              <div className="selection-kicker">Selected Character</div>
              <h2>{selectedCharacter.name}</h2>
              <dl className="metadata-grid">
                <div>
                  <dt>Role</dt>
                  <dd>{selectedCharacter.role || 'n/a'}</dd>
                </div>
                <div>
                  <dt>Status at Open</dt>
                  <dd>{selectedCharacter.status_at_open || 'n/a'}</dd>
                </div>
              </dl>
              <div className="arc-grid">
                <Field title="Season 1 Arc" value={selectedCharacter.arc_season_1} />
                <Field title="Season 2 Arc" value={selectedCharacter.arc_season_2} />
                <Field title="Season 3 Arc" value={selectedCharacter.arc_season_3} />
                <Field title="Notes" value={selectedCharacter.notes} />
              </div>
              <h3>Relationships</h3>
              {relationships.length ? (
                <div className="relationship-list">
                  {relationships.map((relationship) => (
                    <button
                      className="relationship-row relationship-button"
                      key={relationship.id}
                      onClick={() => selectCharacter(getRelatedCharacterId(relationship, selectedCharacter.id))}
                      type="button"
                    >
                      <div className="relationship-row-header">
                        <strong>{getRelatedCharacterName(relationship, selectedCharacter.id)}</strong>
                        <span className={`relationship-type-badge type-${relationship.relationship_type}`}>{formatRelationshipType(relationship.relationship_type)}</span>
                      </div>
                      <span>{relationship.character_a_name} {'->'} {relationship.character_b_name}</span>
                      <p>{relationship.detail}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="muted">No relationships seeded for this character.</p>
              )}
            </>
          ) : (
            <div className="placeholder-block">Select a character.</div>
          )}
        </article>
      </div>
    </section>
  );
}

function getRelatedCharacterId(relationship, selectedCharacterId) {
  return String(relationship.character_a_id) === String(selectedCharacterId)
    ? relationship.character_b_id
    : relationship.character_a_id;
}

function getRelatedCharacterName(relationship, selectedCharacterId) {
  return String(relationship.character_a_id) === String(selectedCharacterId)
    ? relationship.character_b_name
    : relationship.character_a_name;
}

function formatRelationshipType(type) {
  return String(type || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function Field({ title, value }) {
  return (
    <div className="field-card">
      <strong>{title}</strong>
      <p>{value || 'Pending later character seeding.'}</p>
    </div>
  );
}
