import { Clipboard, FileText, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { assembleContextPackSessionContext } from '../contextPackSessionContext.js';
import { useRevivalStore } from '../store.js';

const entityTypes = [
  ['character', 'Characters'],
  ['episode', 'Episodes'],
  ['decision', 'Decisions'],
  ['question', 'Questions'],
  ['living_document', 'Living Documents'],
  ['bible_section', 'Story Bible']
];

export default function ContextPacks() {
  const [newTitle, setNewTitle] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftPurpose, setDraftPurpose] = useState('');
  const [targetType, setTargetType] = useState('character');
  const [targetId, setTargetId] = useState('');
  const [message, setMessage] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const activeContextPackId = useRevivalStore((state) => state.activeContextPackId);
  const contextPacks = useRevivalStore((state) => state.contextPacks);
  const contextPackSessionContexts = useRevivalStore((state) => state.contextPackSessionContexts);
  const loadContextPacks = useRevivalStore((state) => state.loadContextPacks);
  const setActiveContextPackId = useRevivalStore((state) => state.setActiveContextPackId);
  const setContextPackSessionContext = useRevivalStore((state) => state.setContextPackSessionContext);
  const createContextPack = useRevivalStore((state) => state.createContextPack);
  const updateContextPack = useRevivalStore((state) => state.updateContextPack);
  const deleteContextPack = useRevivalStore((state) => state.deleteContextPack);
  const addContextPackLink = useRevivalStore((state) => state.addContextPackLink);
  const removeContextPackLink = useRevivalStore((state) => state.removeContextPackLink);
  const navigateToEntity = useRevivalStore((state) => state.navigateToEntity);
  const entityLinksByKey = useRevivalStore((state) => state.entityLinksByKey);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const characters = useRevivalStore((state) => state.characters);
  const episodes = useRevivalStore((state) => state.episodes);
  const decisions = useRevivalStore((state) => state.decisions);
  const questions = useRevivalStore((state) => state.questions);
  const livingDocs = useRevivalStore((state) => state.livingDocs);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const loadCharacters = useRevivalStore((state) => state.loadCharacters);
  const loadEpisodes = useRevivalStore((state) => state.loadEpisodes);
  const loadDecisions = useRevivalStore((state) => state.loadDecisions);
  const loadQuestions = useRevivalStore((state) => state.loadQuestions);
  const loadLivingDocs = useRevivalStore((state) => state.loadLivingDocs);
  const loadNodeTree = useRevivalStore((state) => state.loadNodeTree);
  const loadCanonTags = useRevivalStore((state) => state.loadCanonTags);
  const selectedPack = useMemo(
    () => contextPacks.find((pack) => String(pack.id) === String(activeContextPackId)) || contextPacks[0] || null,
    [activeContextPackId, contextPacks]
  );
  const targetOptions = useContextPackTargetOptions();
  const linkedKeys = new Set((selectedPack?.links || []).map((link) => `${link.entity_type}:${link.entity_id}`));
  const optionsForType = (targetOptions[targetType] || []).filter((option) => !linkedKeys.has(`${targetType}:${option.id}`));
  const groupedLinks = groupLinksByType(selectedPack?.links || []);
  const selectedPackLinkSignature = (selectedPack?.links || []).map((link) => `${link.entity_type}:${link.entity_id}`).join('|');
  const sessionContextSignature = selectedPack ? `${selectedPack.title || ''}|${selectedPack.purpose || ''}|${selectedPackLinkSignature}` : '';
  const storedSessionContext = selectedPack ? contextPackSessionContexts[selectedPack.id] : null;
  const sessionContext = storedSessionContext?.signature === sessionContextSignature ? storedSessionContext.text : '';

  useEffect(() => {
    loadContextPacks();
    loadCharacters();
    loadEpisodes();
    loadDecisions();
    loadQuestions();
    loadLivingDocs();
    loadNodeTree();
    loadCanonTags();
  }, [loadCanonTags, loadCharacters, loadContextPacks, loadDecisions, loadEpisodes, loadLivingDocs, loadNodeTree, loadQuestions]);

  useEffect(() => {
    if (!selectedPack) {
      setDraftTitle('');
      setDraftPurpose('');
      return;
    }

    setDraftTitle(selectedPack.title || '');
    setDraftPurpose(selectedPack.purpose || '');
  }, [selectedPack?.id, selectedPack?.purpose, selectedPack?.title, selectedPackLinkSignature]);

  const createPack = async (event) => {
    event.preventDefault();
    if (!newTitle.trim() || saving) return;

    await runAction(async () => {
      const response = await createContextPack({ title: newTitle });
      if (response?.ok) {
        setNewTitle('');
        setMessage('Context pack created.');
      }
      return response;
    });
  };

  const savePack = async (event) => {
    event.preventDefault();
    if (!selectedPack || saving) return;

    await runAction(async () => {
      const response = await updateContextPack({
        id: selectedPack.id,
        title: draftTitle,
        purpose: draftPurpose
      });
      if (response?.ok) setMessage('Context pack saved.');
      return response;
    });
  };

  const deletePack = async () => {
    if (!selectedPack || saving) return;

    await runAction(async () => {
      const response = await deleteContextPack(selectedPack.id);
      if (response?.ok) setMessage('Context pack deleted.');
      return response;
    });
  };

  const addLink = async (event) => {
    event.preventDefault();
    if (!selectedPack || !targetId || saving) return;

    await runAction(async () => {
      const response = await addContextPackLink({
        packId: selectedPack.id,
        entityType: targetType,
        entityId: targetId
      });
      if (response?.ok) {
        setTargetId('');
        setMessage('Record added.');
      }
      return response;
    });
  };

  const removeLink = async (linkId) => {
    if (saving) return;

    await runAction(async () => {
      const response = await removeContextPackLink(linkId);
      if (response?.ok) setMessage('Record removed.');
      return response;
    });
  };

  const generateSessionContext = () => {
    if (!selectedPack) return;

    setContextPackSessionContext(selectedPack.id, {
      signature: sessionContextSignature,
      text: assembleContextPackSessionContext({
        title: draftTitle || selectedPack.title,
        purpose: draftPurpose || selectedPack.purpose,
        links: selectedPack.links || [],
        entityTagsByKey,
        entityLinksByKey,
        recordsByType: {
          bible_section: nodeTree,
          character: characters,
          decision: decisions,
          episode: episodes,
          living_document: Object.values(livingDocs).flat(),
          question: questions
        }
      })
    });
    setCopyMessage('');
    setMessage('Session context generated.');
  };

  const copySessionContext = async () => {
    if (!sessionContext) return;

    try {
      await writeClipboardText(sessionContext);
      setCopyMessage('Session context copied.');
      setMessage('Session context copied.');
    } catch (error) {
      setCopyMessage('');
      setMessage(error?.message || 'Session context copy failed.');
    }
  };

  const runAction = async (action) => {
    setSaving(true);
    setMessage('');
    try {
      const response = await action();
      if (!response?.ok) {
        setMessage(response?.message || 'Context pack action failed.');
      }
    } catch (error) {
      setMessage(error?.message || 'Context pack action failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Context Packs</div>
      <h1>Context Packs</h1>
      <p className="dashboard-lede">Reusable bundles of selected records for future creative sessions.</p>

      <div className="context-pack-workspace">
        <aside className="phase3b-list-panel context-pack-list-panel">
          <form className="context-pack-create" onSubmit={createPack}>
            <input
              disabled={saving}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="New context pack"
              value={newTitle}
            />
            <button className="icon-button" disabled={saving || !newTitle.trim()} title="Create context pack" type="submit">
              <Plus size={15} />
            </button>
          </form>

          {contextPacks.length ? contextPacks.map((pack) => (
            <button
              className={`phase3b-card ${String(selectedPack?.id) === String(pack.id) ? 'selected' : ''}`}
              key={pack.id}
              onClick={() => setActiveContextPackId(pack.id)}
              type="button"
            >
              <div className="phase3b-card-topline">
                <span>{pack.links?.length || 0} records</span>
              </div>
              <strong>{pack.title}</strong>
              <p>{pack.purpose || 'No purpose notes yet.'}</p>
            </button>
          )) : (
            <div className="placeholder-block">No context packs yet.</div>
          )}
        </aside>

        <article className="detail-panel phase3b-detail-panel context-pack-detail-panel">
          {selectedPack ? (
            <>
              <form className="context-pack-editor" onSubmit={savePack}>
                <div className="document-header">
                  <div>
                    <div className="eyebrow">Selected Pack</div>
                    <input
                      disabled={saving}
                      onChange={(event) => setDraftTitle(event.target.value)}
                      value={draftTitle}
                    />
                  </div>
                  <div className="context-pack-actions">
                    <button className="secondary-button context-generate-button" onClick={generateSessionContext} title="Generate Session Context" type="button">
                      <FileText size={15} />
                      <span>Generate Session Context</span>
                    </button>
                    <button className="icon-button" disabled={saving || !draftTitle.trim()} title="Save context pack" type="submit">
                      <Save size={15} />
                    </button>
                    <button className="icon-button danger-button" disabled={saving} onClick={deletePack} title="Delete context pack" type="button">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <label className="context-pack-purpose">
                  <span>Purpose Notes</span>
                  <textarea
                    disabled={saving}
                    onChange={(event) => setDraftPurpose(event.target.value)}
                    rows={5}
                    value={draftPurpose}
                  />
                </label>
              </form>

              <form className="context-pack-add" onSubmit={addLink}>
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
                <button className="icon-button" disabled={saving || !targetId} title="Add record" type="submit">
                  <Plus size={15} />
                </button>
              </form>

              <div className="context-pack-groups">
                {entityTypes.map(([type, label]) => (
                  groupedLinks[type]?.length ? (
                    <section className="context-pack-group" key={type}>
                      <h2>{label}</h2>
                      <div className="related-record-list">
                        {groupedLinks[type].map((link) => (
                          <div className={`related-record-chip ${link.missing ? 'stale' : ''}`} key={link.id}>
                            <button disabled={link.missing} onClick={() => navigateToEntity(link.entity_type, link.entity_id)} type="button">
                              <span>{label}</span>
                              <strong>{link.title}</strong>
                              <small>{link.section}</small>
                            </button>
                            <button
                              aria-label={`Remove ${link.title}`}
                              className="related-record-remove"
                              disabled={saving}
                              onClick={() => removeLink(link.id)}
                              title={`Remove ${link.title}`}
                              type="button"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  ) : null
                ))}
                {selectedPack.links?.length ? null : (
                  <div className="placeholder-block">No records added yet.</div>
                )}
              </div>
              {sessionContext ? (
                <section className="session-context-output" aria-label="Generated session context">
                  <div className="session-context-header">
                    <h2>Generated Session Context</h2>
                    <div className="session-context-copy">
                      {copyMessage ? <span className="session-context-copy-message">{copyMessage}</span> : null}
                      <button className="secondary-button context-copy-button" onClick={copySessionContext} type="button">
                        <Clipboard size={15} />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="session-context-records" aria-label="Generated context linked records">
                    {entityTypes.map(([type, label]) => (
                      groupedLinks[type]?.length ? (
                        <section className="session-context-record-group" key={type}>
                          <h3>{label}</h3>
                          <div>
                            {groupedLinks[type].map((link) => (
                              <button disabled={link.missing} key={link.id} onClick={() => navigateToEntity(link.entity_type, link.entity_id)} type="button">
                                <span>{link.section}</span>
                                <strong>{link.title}</strong>
                              </button>
                            ))}
                          </div>
                        </section>
                      ) : null
                    ))}
                  </div>
                  <textarea readOnly rows={16} value={sessionContext} />
                </section>
              ) : null}
              {message ? <p className="editor-message">{message}</p> : null}
            </>
          ) : (
            <div className="placeholder-block">Create a context pack to start adding records.</div>
          )}
        </article>
      </div>
    </section>
  );
}

function useContextPackTargetOptions() {
  const characters = useRevivalStore((state) => state.characters);
  const decisions = useRevivalStore((state) => state.decisions);
  const questions = useRevivalStore((state) => state.questions);
  const episodes = useRevivalStore((state) => state.episodes);
  const livingDocs = useRevivalStore((state) => state.livingDocs);
  const nodeTree = useRevivalStore((state) => state.nodeTree);

  return useMemo(() => ({
    character: characters.map((character) => ({ id: character.id, title: character.name })),
    episode: episodes.map((episode) => ({ id: episode.id, title: `S${episode.season}E${episode.episode_number} ${episode.title}` })),
    decision: [...decisions]
      .sort(compareDecisions)
      .map((decision) => ({ id: decision.id, title: `#${decision.sequence_number} ${decision.title}` })),
    question: questions.map((question) => ({ id: question.id, title: question.question })),
    living_document: Object.values(livingDocs).flat().map((document) => ({
      id: document.id,
      title: `${formatDocType(document.doc_type)} Entry ${document.entry_number || document.id}`
    })),
    bible_section: nodeTree.map((node) => ({ id: node.id, title: node.title }))
  }), [characters, decisions, episodes, livingDocs, nodeTree, questions]);
}

function groupLinksByType(links) {
  return links.reduce((groups, link) => {
    groups[link.entity_type] = groups[link.entity_type] || [];
    groups[link.entity_type].push(link);
    if (link.entity_type === 'decision') {
      groups[link.entity_type].sort(compareContextPackLinks);
    }
    return groups;
  }, {});
}

function compareDecisions(a, b) {
  return Number(a.sequence_number || 0) - Number(b.sequence_number || 0)
    || Number(a.id || 0) - Number(b.id || 0);
}

function compareContextPackLinks(a, b) {
  return getDecisionLinkNumber(a) - getDecisionLinkNumber(b)
    || Number(a.entity_id || 0) - Number(b.entity_id || 0)
    || Number(a.id || 0) - Number(b.id || 0);
}

function getDecisionLinkNumber(link) {
  return Number(String(link.section || '').match(/#(\d+)/)?.[1] || link.entity_id || 0);
}

async function writeClipboardText(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back below when Electron exposes clipboard but the document is not focused.
    }
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const copied = document.execCommand('copy');
    if (!copied) throw new Error('Clipboard command was not accepted.');
  } finally {
    document.body.removeChild(textarea);
  }
}

function formatDocType(docType) {
  const labels = {
    rewatch_ledger: 'Rewatch Ledger',
    dread_map: 'Dread Map',
    obligation_ledger: 'Obligation Ledger',
    caroline_map: 'Caroline Logic Map'
  };

  return labels[docType] || String(docType || '').split(/[-_]/).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}
