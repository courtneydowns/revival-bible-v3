import { useEffect, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import EntityPreviewCard from './EntityPreviewCard.jsx';
import InspectorPanel from './InspectorPanel.jsx';
import PromotionProvenance from './PromotionProvenance.jsx';
import MasterDetailShell from './MasterDetailShell.jsx';
import RelatedRecords from './RelatedRecords.jsx';
import StatusBadge from './StatusBadge.jsx';
import StatusSelector from './StatusSelector.jsx';
import TagEditor from './TagEditor.jsx';

export default function CharacterWorkspace() {
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const appliedNavigationFocusTick = useRef(0);
  const characterCardRefs = useRef(new Map());
  const listPanelRef = useRef(null);
  const activeCharacterId = useRevivalStore((state) => state.activeCharacterId);
  const characters = useRevivalStore((state) => state.characters);
  const navigationFocusTick = useRevivalStore((state) => state.navigationFocusTick);
  const selectedCharacter = useRevivalStore((state) => state.selectedCharacter);
  const relationships = useRevivalStore((state) => state.selectedCharacterRelationships);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const entityLinksByKey = useRevivalStore((state) => state.entityLinksByKey);
  const selectCharacter = useRevivalStore((state) => state.selectCharacter);

  useEffect(() => {
    if (!activeCharacterId && characters.length) {
      selectCharacter(characters[0].id);
    }
  }, [activeCharacterId, characters, selectCharacter]);

  useEffect(() => {
    if (!activeCharacterId || !navigationFocusTick) return;
    if (appliedNavigationFocusTick.current === navigationFocusTick) return;

    appliedNavigationFocusTick.current = navigationFocusTick;
    scheduleRecordScroll(characterCardRefs.current.get(String(activeCharacterId)), listPanelRef.current);
  }, [activeCharacterId, characters.length, navigationFocusTick]);

  return (
    <section className="view character-workspace">
      <div className="eyebrow">Characters</div>
      <h1>Character Workspace</h1>
      <MasterDetailShell
        className={`character-master-detail ${inspectorCollapsed ? 'inspector-collapsed' : ''}`}
        listLabel="Characters"
        listRef={listPanelRef}
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
            ref={(node) => {
              if (node) {
                characterCardRefs.current.set(String(character.id), node);
              } else {
                characterCardRefs.current.delete(String(character.id));
              }
            }}
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
                <PromotionProvenance text={selectedCharacter.notes} />
                <RelatedRecords
                  entityId={selectedCharacter.id}
                  entityType="character"
                  links={entityLinksByKey[`character:${selectedCharacter.id}`] || []}
                />
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

function scheduleRecordScroll(card, listPanel) {
  if (!card || !listPanel) return;

  const scroll = () => {
    if (!card.isConnected || !listPanel.isConnected) return;

    const scrollContainer = getScrollContainer(card, listPanel);
    const cardRect = card.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const centerOffset = Math.max((scrollContainer.clientHeight - cardRect.height) / 2, 0);
    const nextTop = scrollContainer.scrollTop + cardRect.top - containerRect.top - centerOffset;

    scrollContainer.scrollTop = Math.max(nextTop, 0);
    ensureViewportVisible(card);

    card.focus({ preventScroll: true });
  };

  requestAnimationFrame(scroll);
  setTimeout(scroll, 50);
  setTimeout(scroll, 150);
  setTimeout(scroll, 500);
  setTimeout(scroll, 1000);
}

function getScrollContainer(card, fallback) {
  let current = card.parentElement;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScroll = /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 1;
    if (canScroll) return current;
    current = current.parentElement;
  }

  return fallback;
}

function ensureViewportVisible(card) {
  const rect = card.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < window.innerHeight) return;

  const content = document.querySelector('.content');
  if (!content || content.scrollHeight <= content.clientHeight + 1) return;

  const contentRect = content.getBoundingClientRect();
  const centerOffset = Math.max((content.clientHeight - rect.height) / 2, 0);
  content.scrollTop = Math.max(content.scrollTop + rect.top - contentRect.top - centerOffset, 0);
}
