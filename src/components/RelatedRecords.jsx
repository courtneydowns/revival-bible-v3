import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';

const entityTypes = [
  ['character', 'Character'],
  ['decision', 'Decision'],
  ['question', 'Question'],
  ['episode', 'Episode'],
  ['timeline_event', 'Timeline'],
  ['living_document', 'Living Doc'],
  ['bible_section', 'Story Bible']
];

const relationshipOptions = [
  'related',
  'depends_on',
  'answers',
  'unresolved_question',
  'contradiction_risk',
  'appears_in',
  'contains',
  'tracked_by',
  'anchored_by'
];

export default function RelatedRecords({ entityId, entityType, links = [] }) {
  const [targetType, setTargetType] = useState('character');
  const [targetId, setTargetId] = useState('');
  const [relationshipType, setRelationshipType] = useState('related');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const addEntityLink = useRevivalStore((state) => state.addEntityLink);
  const removeEntityLink = useRevivalStore((state) => state.removeEntityLink);
  const navigateToEntity = useRevivalStore((state) => state.navigateToEntity);
  const targetOptions = useLinkTargetOptions();
  const optionsForType = useMemo(
    () => (targetOptions[targetType] || []).filter((option) => !(targetType === entityType && String(option.id) === String(entityId))),
    [entityId, entityType, targetOptions, targetType]
  );

  const addLink = async (event) => {
    event.preventDefault();
    if (!targetId || saving) return;

    setSaving(true);
    setMessage('');
    try {
      const response = await addEntityLink({
        sourceType: entityType,
        sourceId: entityId,
        targetType,
        targetId,
        relationshipType
      });

      if (response?.ok) {
        setTargetId('');
      } else {
        setMessage(response?.message || 'Link was not added.');
      }
    } catch (error) {
      setMessage(error?.message || 'Link was not added.');
    } finally {
      setSaving(false);
    }
  };

  const removeLink = async (linkId) => {
    if (saving) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await removeEntityLink({ linkId, entityType, entityId });
      if (!response?.ok) {
        setMessage(response?.message || 'Link was not removed.');
      }
    } catch (error) {
      setMessage(error?.message || 'Link was not removed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="related-records" aria-label="Linked records">
      <div className="related-records-header">
        <h3>Linked Records</h3>
      </div>
      {links.length ? (
        <div className="related-record-list">
          {links.map((link) => (
            <div className={`related-record-chip ${link.target_missing ? 'stale' : ''}`} key={link.id}>
              <button
                disabled={link.target_missing}
                onClick={() => navigateToEntity(link.related_type, link.related_id)}
                type="button"
              >
                <span>{formatEntityType(link.related_type)}</span>
                <strong>{link.related_title}</strong>
                <small>{formatRelationshipType(link.relationship_type)}{link.related_section ? ` / ${link.related_section}` : ''}</small>
                {link.note ? <p>{link.note}</p> : null}
              </button>
              <button
                aria-label={`Remove link to ${link.related_title}`}
                className="related-record-remove"
                disabled={saving}
                onClick={() => removeLink(link.id)}
                title={`Remove link to ${link.related_title}`}
                type="button"
              >
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted small-note">No linked records yet.</p>
      )}

      <form className="related-record-add" onSubmit={addLink}>
        <select disabled={saving} onChange={(event) => {
          setTargetType(event.target.value);
          setTargetId('');
        }} value={targetType}>
          {entityTypes.map(([type, label]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>
        <select disabled={saving || !optionsForType.length} onChange={(event) => setTargetId(event.target.value)} value={targetId}>
          <option value="">{optionsForType.length ? 'Choose record' : 'No records'}</option>
          {optionsForType.map((option) => (
            <option key={option.id} value={option.id}>{option.title}</option>
          ))}
        </select>
        <select disabled={saving} onChange={(event) => setRelationshipType(event.target.value)} value={relationshipType}>
          {relationshipOptions.map((type) => (
            <option key={type} value={type}>{formatRelationshipType(type)}</option>
          ))}
        </select>
        <button className="icon-button" disabled={saving || !targetId} title="Add linked record" type="submit">
          <Plus size={15} />
        </button>
      </form>
      {message ? <p className="editor-message">{message}</p> : null}
    </section>
  );
}

function useLinkTargetOptions() {
  const characters = useRevivalStore((state) => state.characters);
  const decisions = useRevivalStore((state) => state.decisions);
  const questions = useRevivalStore((state) => state.questions);
  const episodes = useRevivalStore((state) => state.episodes);
  const timelineEvents = useRevivalStore((state) => state.timelineEvents);
  const livingDocs = useRevivalStore((state) => state.livingDocs);
  const nodeTree = useRevivalStore((state) => state.nodeTree);

  return useMemo(() => ({
    character: characters.map((character) => ({ id: character.id, title: character.name })),
    decision: decisions.map((decision) => ({ id: decision.id, title: `#${decision.sequence_number} ${decision.title}` })),
    question: questions.map((question) => ({ id: question.id, title: question.question })),
    episode: episodes.map((episode) => ({ id: episode.id, title: `S${episode.season}E${episode.episode_number} ${episode.title}` })),
    timeline_event: timelineEvents.map((event) => ({ id: event.id, title: event.title })),
    living_document: Object.values(livingDocs).flat().map((document) => ({
      id: document.id,
      title: `${formatDocType(document.doc_type)} Entry ${document.entry_number || document.id}`
    })),
    bible_section: nodeTree.map((node) => ({ id: node.id, title: node.title }))
  }), [characters, decisions, episodes, livingDocs, nodeTree, questions, timelineEvents]);
}

function formatEntityType(entityType) {
  const label = entityTypes.find(([type]) => type === entityType)?.[1];
  return label || formatRelationshipType(entityType);
}

function formatDocType(docType) {
  const labels = {
    rewatch_ledger: 'Rewatch Ledger',
    dread_map: 'Dread Map',
    obligation_ledger: 'Obligation Ledger',
    caroline_map: 'Caroline Logic Map'
  };

  return labels[docType] || formatRelationshipType(docType);
}

function formatRelationshipType(type) {
  return String(type || '')
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
