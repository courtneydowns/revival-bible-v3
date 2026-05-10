import { useEffect, useState } from 'react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import EntityPreviewCard from './EntityPreviewCard.jsx';
import InspectorPanel from './InspectorPanel.jsx';
import MasterDetailShell from './MasterDetailShell.jsx';
import StatusBadge from './StatusBadge.jsx';
import StatusSelector from './StatusSelector.jsx';
import TagEditor from './TagEditor.jsx';

export default function CharacterWorkspace() {
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const activeCharacterId = useRevivalStore((state) => state.activeCharacterId);
  const characters = useRevivalStore((state) => state.characters);
  const selectedCharacter = useRevivalStore((state) => state.selectedCharacter);
  const relationships = useRevivalStore((state) => state.selectedCharacterRelationships);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const selectCharacter = useRevivalStore((state) => state.selectCharacter);

  useEffect(() => {
    if (!activeCharacterId && characters.length) {
      selectCharacter(characters[0].id);
    }
  }, [activeCharacterId, characters, selectCharacter]);

  return (
    <section className="view character-workspace">
      <div className="eyebrow">Characters</div>
      <h1>Character Workspace</h1>
      <MasterDetailShell
        className={`character-master-detail ${inspectorCollapsed ? 'inspector-collapsed' : ''}`}
        listLabel="Characters"
        list={characters.map((character) => (
          <EntityPreviewCard
            active={String(activeCharacterId) === String(character.id)}
            key={character.id}
            meta={[character.role, character.status_at_open ? `Open: ${character.status_at_open}` : null]}
            onSelect={() => selectCharacter(character.id)}
            status={<StatusBadge status={character.canon_state} />}
            tags={entityTagsByKey[`character:${character.id}`] || []}
            title={character.name}
            type="Character"
          />
        ))}
        inspector={(
          <InspectorPanel
            badges={selectedCharacter ? <CanonTagBadges tags={entityTagsByKey[`character:${selectedCharacter.id}`] || []} /> : null}
            className="character-detail-panel"
            collapsed={inspectorCollapsed}
            emptyText="Select a character."
            kicker="Selected Character"
            onToggleCollapsed={() => setInspectorCollapsed((value) => !value)}
            status={selectedCharacter ? <StatusBadge status={selectedCharacter.canon_state} /> : null}
            title={selectedCharacter?.name}
          >
            {selectedCharacter ? (
              <>
                <StatusSelector
                  currentStatus={selectedCharacter.canon_state}
                  entityId={selectedCharacter.id}
                  entityType="character"
                  label="Canon State"
                />
                <TagEditor
                  entityId={selectedCharacter.id}
                  entityType="character"
                  tags={entityTagsByKey[`character:${selectedCharacter.id}`] || []}
                />
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
            ) : null}
          </InspectorPanel>
        )}
      />
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
