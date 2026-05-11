import { Check, ExternalLink, Info, Plus, Send, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';

const acceptedStatus = 'Accepted / Needs Placement';
const statuses = ['New', 'In Review', acceptedStatus, 'Promoted', 'Rejected'];
const statusFilters = [
  ['All', 'All candidates'],
  ['New', 'Pending review'],
  ['In Review', 'In review'],
  [acceptedStatus, 'Needs placement'],
  ['Promoted', 'Promoted'],
  ['Rejected', 'Rejected']
];
const statusCopy = {
  New: {
    label: 'Pending',
    summary: 'Awaiting first review.'
  },
  'In Review': {
    label: 'In Review',
    summary: 'Being evaluated.'
  },
  [acceptedStatus]: {
    label: 'Needs Placement',
    summary: 'Accepted to keep, not canon.'
  },
  Promoted: {
    label: 'Promoted',
    summary: 'Traceable canon record exists.'
  },
  Rejected: {
    label: 'Rejected',
    summary: 'Archived from active review.'
  }
};
const promotionTargets = [
  ['character', 'Character'],
  ['episode', 'Episode'],
  ['decision', 'Decision'],
  ['question', 'Question'],
  ['location', 'Location'],
  ['bible_section', 'Story Bible entry/section']
];

export default function CandidateInbox() {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftType, setDraftType] = useState('Narrative Note');
  const [editDraft, setEditDraft] = useState({ title: '', content: '', type: 'Narrative Note', notes: '' });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState('character');
  const [promotionDraft, setPromotionDraft] = useState(createPromotionDraft(null, 'character'));
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const typeInputRef = useRef(null);
  const candidates = useRevivalStore((state) => state.candidates);
  const nodeTree = useRevivalStore((state) => state.nodeTree);
  const activeCandidateId = useRevivalStore((state) => state.activeCandidateId);
  const loadCandidates = useRevivalStore((state) => state.loadCandidates);
  const loadCharacters = useRevivalStore((state) => state.loadCharacters);
  const loadEpisodes = useRevivalStore((state) => state.loadEpisodes);
  const loadDecisions = useRevivalStore((state) => state.loadDecisions);
  const loadQuestions = useRevivalStore((state) => state.loadQuestions);
  const loadLivingDocs = useRevivalStore((state) => state.loadLivingDocs);
  const loadNodeTree = useRevivalStore((state) => state.loadNodeTree);
  const selectCandidate = useRevivalStore((state) => state.selectCandidate);
  const createCandidate = useRevivalStore((state) => state.createCandidate);
  const updateCandidate = useRevivalStore((state) => state.updateCandidate);
  const updateCandidateStatus = useRevivalStore((state) => state.updateCandidateStatus);
  const deleteCandidate = useRevivalStore((state) => state.deleteCandidate);
  const navigateToEntity = useRevivalStore((state) => state.navigateToEntity);
  const openCandidateSourceSession = useRevivalStore((state) => state.openCandidateSourceSession);
  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => String(candidate.id) === String(activeCandidateId)) || candidates[0] || null,
    [activeCandidateId, candidates]
  );
  const filteredCandidates = useMemo(
    () => statusFilter === 'All'
      ? candidates
      : candidates.filter((candidate) => normalizeCandidateStatusLabel(candidate.status) === statusFilter),
    [candidates, statusFilter]
  );
  const queueCounts = useMemo(() => {
    const counts = Object.fromEntries(statuses.map((status) => [status, 0]));
    candidates.forEach((candidate) => {
      const status = normalizeCandidateStatusLabel(candidate.status);
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [candidates]);
  const activeQueueCount = (queueCounts.New || 0) + (queueCounts['In Review'] || 0) + (queueCounts[acceptedStatus] || 0);
  const traceableQueueCount = (queueCounts.Promoted || 0) + (queueCounts.Rejected || 0);
  const selectedFilterSummary = statusFilter === 'All'
    ? 'Pending, in-review, accepted, promoted, and rejected candidates.'
    : statusCopy[statusFilter]?.summary;

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    if (!activeCandidateId && candidates.length) {
      selectCandidate(candidates[0].id);
    }
  }, [activeCandidateId, candidates, selectCandidate]);

  useEffect(() => {
    if (!selectedCandidate) {
      setEditing(false);
      setEditDraft({ title: '', content: '', type: 'Narrative Note', notes: '' });
      return;
    }

    setEditing(false);
    setEditDraft({
      title: selectedCandidate.title || '',
      content: selectedCandidate.content || '',
      type: selectedCandidate.type || 'Narrative Note',
      notes: selectedCandidate.notes || ''
    });
    setPromotionOpen(false);
    setPromotionTarget('character');
    setPromotionDraft(createPromotionDraft(selectedCandidate, 'character'));
  }, [selectedCandidate?.id]);

  const addCandidate = async (event) => {
    event.preventDefault();
    const title = titleInputRef.current?.value || draftTitle;
    const content = contentInputRef.current?.value || draftContent;
    const type = typeInputRef.current?.value || draftType;
    if (!title.trim() || saving) return;

    setSaving(true);
    const response = await createCandidate({
      title,
      content,
      type,
      provenanceMetadata: {
        source: 'Manual editorial note',
        workflow: 'Candidate Inbox'
      }
    });
    setSaving(false);

    if (response?.ok) {
      setDraftTitle('');
      setDraftContent('');
      setDraftType('Narrative Note');
      if (titleInputRef.current) titleInputRef.current.value = '';
      if (contentInputRef.current) contentInputRef.current.value = '';
      if (typeInputRef.current) typeInputRef.current.value = 'Narrative Note';
      setMessage('Candidate preserved for review.');
    } else {
      setMessage(response?.message || 'Candidate could not be saved.');
    }
  };

  const updateEditDraft = (field, value) => {
    setEditDraft((draft) => ({ ...draft, [field]: value }));
  };

  const cancelEdit = () => {
    if (!selectedCandidate) return;
    setEditDraft({
      title: selectedCandidate.title || '',
      content: selectedCandidate.content || '',
      type: selectedCandidate.type || 'Narrative Note',
      notes: selectedCandidate.notes || ''
    });
    setEditing(false);
  };

  const saveCandidate = async () => {
    if (!selectedCandidate || saving || !editDraft.title.trim()) return;

    setSaving(true);
    const response = await updateCandidate({
      id: selectedCandidate.id,
      title: editDraft.title,
      content: editDraft.content,
      type: editDraft.type,
      notes: editDraft.notes
    });
    setSaving(false);

    if (response?.ok) {
      setEditing(false);
      setMessage('Candidate edits saved.');
    } else {
      setMessage(response?.message || 'Candidate edits could not be saved.');
    }
  };

  const setStatus = async (status) => {
    if (!selectedCandidate || saving) return;

    setSaving(true);
    const response = await updateCandidateStatus({ id: selectedCandidate.id, status });
    setSaving(false);
    setMessage(response?.ok ? `Marked ${status}.` : response?.message || 'Status update failed.');
  };

  const openPromotionReview = () => {
    if (!selectedCandidate) return;
    setPromotionTarget('character');
    setPromotionDraft(createPromotionDraft(selectedCandidate, 'character'));
    setPromotionOpen(true);
  };

  const setPromotionField = (field, value) => {
    setPromotionDraft((draft) => ({ ...draft, [field]: value }));
  };

  const changePromotionTarget = (target) => {
    setPromotionTarget(target);
    setPromotionDraft(createPromotionDraft(selectedCandidate, target));
  };

  const promoteCandidate = async () => {
    if (!selectedCandidate || saving || !promotionDraft.title.trim()) return;

    setSaving(true);
    const response = await window.revival?.candidates?.promote?.({
      id: selectedCandidate.id,
      targetType: promotionTarget,
      fields: promotionDraft
    });
    setSaving(false);

    if (response?.ok) {
      await refreshAfterPromotion(response.target?.entityType);
      setPromotionOpen(false);
      setMessage(`Promoted to ${response.target?.label || 'canon record'}. Candidate preserved.`);
    } else {
      setMessage(response?.message || 'Promotion failed.');
    }
  };

  const refreshAfterPromotion = async (entityType) => {
    await loadCandidates();
    if (entityType === 'character') await loadCharacters();
    if (entityType === 'episode') await loadEpisodes();
    if (entityType === 'decision') await loadDecisions();
    if (entityType === 'question') await loadQuestions();
    if (entityType === 'living_document') await loadLivingDocs();
    if (entityType === 'bible_section') await loadNodeTree();
  };

  const removeCandidate = async () => {
    if (!selectedCandidate || saving) return;

    const confirmed = window.confirm(`Permanently delete "${selectedCandidate.title}"? Rejected candidates are preserved; deletion removes only this candidate.`);
    if (!confirmed) return;

    setSaving(true);
    const response = await deleteCandidate(selectedCandidate.id);
    setSaving(false);
    setMessage(response?.ok ? 'Candidate permanently deleted.' : response?.message || 'Candidate delete failed.');
  };

  const openSourceSession = async () => {
    if (!selectedCandidate || saving) return;

    const response = await openCandidateSourceSession(selectedCandidate);
    if (!response?.ok) {
      setMessage(response?.message || 'Source AI session could not be opened.');
    }
  };

  return (
    <section className="view candidate-inbox-view">
      <div className="candidate-header">
        <div>
          <div className="eyebrow">Editorial Review</div>
          <h1>Candidates Inbox</h1>
          <p className="dashboard-lede">AI-generated and editorial ideas wait here for review before anything becomes canon.</p>
        </div>
      </div>

      <div className="candidate-layout">
        <aside className="candidate-list-panel" aria-label="Candidate list">
          <form className="candidate-create" onSubmit={addCandidate}>
            <div className="candidate-create-heading">
              <strong>New Candidate</strong>
              <span>Preserved until reviewed.</span>
            </div>
            <input
              aria-label="Candidate title"
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Add a candidate title"
              ref={titleInputRef}
              value={draftTitle}
            />
            <select aria-label="Candidate type" onChange={(event) => setDraftType(event.target.value)} ref={typeInputRef} value={draftType}>
              <option>Narrative Note</option>
              <option>Continuity Question</option>
              <option>Character Detail</option>
              <option>Timeline Detail</option>
            </select>
            <textarea
              aria-label="Candidate content"
              onChange={(event) => setDraftContent(event.target.value)}
              placeholder="Candidate content or note"
              ref={contentInputRef}
              value={draftContent}
            />
            <button className="primary-button" disabled={saving || !draftTitle.trim()} onClick={addCandidate} type="submit">
              <Plus size={15} />
              <span>Add Candidate</span>
            </button>
          </form>

          <div className="candidate-filter">
            <label>
              <span>Queue</span>
              <select aria-label="Filter candidates by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                {statusFilters.map(([status, label]) => (
                  <option key={status} value={status}>
                    {label} ({status === 'All' ? candidates.length : queueCounts[status] || 0})
                  </option>
                ))}
              </select>
            </label>
            <div className="candidate-filter-summary" aria-live="polite">
              <strong>{filteredCandidates.length}</strong>
              <span>{selectedFilterSummary}</span>
            </div>
            <div className="candidate-queue-counts" aria-label="Candidate queue totals">
              <span>Active {activeQueueCount}</span>
              <span>Traceable {traceableQueueCount}</span>
            </div>
          </div>

          <div className="candidate-list">
            {filteredCandidates.length ? filteredCandidates.map((candidate, index) => (
              <button
                className={`candidate-card ${statusClassName(candidate.status)} ${String(selectedCandidate?.id) === String(candidate.id) ? 'selected' : ''}`}
                key={candidate.id}
                onClick={() => selectCandidate(candidate.id)}
                type="button"
              >
                <span className="candidate-card-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="candidate-card-topline">
                  <CandidateStatusBadge status={candidate.status} />
                  <span>{candidate.type || 'Narrative Note'}</span>
                </span>
                <strong>{candidate.title}</strong>
                <span className="candidate-card-state">{statusCopy[normalizeCandidateStatusLabel(candidate.status)]?.summary}</span>
                <span>{candidate.content || 'No content yet.'}</span>
              </button>
            )) : candidates.length ? (
              <div className="candidate-empty-state">
                <strong>No {statusFilter === 'All' ? 'candidates' : statusFilters.find(([status]) => status === statusFilter)?.[1].toLowerCase()}.</strong>
                <span>This queue is clear for now. Change the filter to review another status.</span>
              </div>
            ) : (
              <div className="candidate-empty-state">
                <strong>No candidates yet.</strong>
                <span>Add a manual test candidate to start the review queue.</span>
                <button className="secondary-button" onClick={() => titleInputRef.current?.focus()} type="button">
                  <Plus size={14} />
                  <span>New Candidate</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="candidate-detail-panel" aria-label="Candidate detail">
          {selectedCandidate ? (
            <>
              <div className="candidate-detail-heading">
                <div>
                  {editing ? (
                    <select
                      aria-label="Edit candidate type"
                      className="candidate-inline-select"
                      onChange={(event) => updateEditDraft('type', event.target.value)}
                      value={editDraft.type}
                    >
                      <option>Narrative Note</option>
                      <option>Continuity Question</option>
                      <option>Character Detail</option>
                      <option>Timeline Detail</option>
                    </select>
                  ) : (
                    <span className="selection-kicker">{selectedCandidate.type || 'Narrative Note'}</span>
                  )}
                  {editing ? (
                    <input
                      aria-label="Edit candidate title"
                      className="candidate-title-input"
                      onChange={(event) => updateEditDraft('title', event.target.value)}
                      value={editDraft.title}
                    />
                  ) : (
                    <h2>{selectedCandidate.title}</h2>
                  )}
                </div>
                <CandidateStatusBadge status={selectedCandidate.status} />
              </div>

              <div className="candidate-content">
                {editing ? (
                  <textarea
                    aria-label="Edit candidate content"
                    onChange={(event) => updateEditDraft('content', event.target.value)}
                    value={editDraft.content}
                  />
                ) : (
                  <p>{selectedCandidate.content || 'No candidate content has been added yet.'}</p>
                )}
              </div>

              <div className="candidate-actions" aria-label="Candidate status actions">
                {editing ? (
                  <>
                    <button className="secondary-button" disabled={saving || !editDraft.title.trim()} onClick={saveCandidate} type="button">
                      <Check size={14} />
                      <span>Save</span>
                    </button>
                    <button className="secondary-button" disabled={saving} onClick={cancelEdit} type="button">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="secondary-button" disabled={saving} onClick={() => setEditing(true)} type="button">
                    Edit
                  </button>
                )}
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'In Review'} onClick={() => setStatus('In Review')} type="button">
                  In Review
                </button>
                <button className="secondary-button" disabled={saving || selectedCandidate.status === acceptedStatus} onClick={() => setStatus(acceptedStatus)} type="button">
                  <Check size={14} />
                  <span>Accepted / Needs Placement</span>
                </button>
                <button className="secondary-button" disabled={saving || editing} onClick={openPromotionReview} type="button">
                  <Send size={14} />
                  <span>Promote to...</span>
                </button>
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'Rejected'} onClick={() => setStatus('Rejected')} type="button">
                  <X size={14} />
                  <span>Reject</span>
                </button>
                <button className="secondary-button danger-button candidate-delete-button" disabled={saving || selectedCandidate.status === 'Promoted'} onClick={removeCandidate} type="button">
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>

              {selectedCandidate.status === acceptedStatus ? (
                <div className="candidate-acceptance-note">
                  <strong>Accepted.</strong>
                  <span>Needs a placement decision later; not canon until explicitly promoted.</span>
                </div>
              ) : null}

              <div className="candidate-provenance">
                <span>Provenance</span>
                <Info size={14} title={formatProvenance(selectedCandidate)} />
                <small>{formatProvenanceSummary(selectedCandidate)}</small>
                {getCandidatePromotions(selectedCandidate).map((promotion) => (
                  <button
                    className="candidate-source-link"
                    key={`${promotion.target_type}:${promotion.target_id}:${promotion.promoted_at}`}
                    onClick={() => navigateToEntity(promotion.target_type, promotion.target_id)}
                    type="button"
                  >
                    <ExternalLink size={13} />
                    <span>Open {promotion.target_label || 'Canon Record'}</span>
                  </button>
                ))}
                {hasSourceSession(selectedCandidate) ? (
                  <button className="candidate-source-link" disabled={saving} onClick={openSourceSession} type="button">
                    <ExternalLink size={13} />
                    <span>Open Source Session</span>
                  </button>
                ) : null}
              </div>

              {promotionOpen ? (
                <div className="candidate-promotion-panel" aria-label="Promotion review">
                  <div className="candidate-promotion-heading">
                    <div>
                      <span>Promotion Review</span>
                      <strong>{promotionTargets.find(([value]) => value === promotionTarget)?.[1]}</strong>
                    </div>
                    <button className="icon-button" disabled={saving} onClick={() => setPromotionOpen(false)} title="Close promotion review" type="button">
                      <X size={15} />
                    </button>
                  </div>

                  <div className="candidate-promotion-fields">
                    <label>
                      <span>Promote to</span>
                      <select onChange={(event) => changePromotionTarget(event.target.value)} value={promotionTarget}>
                        {promotionTargets.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    {promotionTarget === 'bible_section' ? (
                      <label>
                        <span>Destination section</span>
                        <select onChange={(event) => setPromotionField('parent_id', event.target.value)} value={promotionDraft.parent_id}>
                          {nodeTree.filter((node) => !node.parent_id).map((node) => (
                            <option key={node.id} value={node.id}>{node.title}</option>
                          ))}
                        </select>
                      </label>
                    ) : null}
                    {promotionTarget === 'episode' ? (
                      <div className="candidate-promotion-row">
                        <label>
                          <span>Season</span>
                          <input min="1" max="3" onChange={(event) => setPromotionField('season', event.target.value)} type="number" value={promotionDraft.season} />
                        </label>
                        <label>
                          <span>Episode</span>
                          <input min="1" onChange={(event) => setPromotionField('episode_number', event.target.value)} type="number" value={promotionDraft.episode_number} />
                        </label>
                      </div>
                    ) : null}
                    {promotionTarget === 'decision' ? (
                      <label>
                        <span>Tier</span>
                        <select onChange={(event) => setPromotionField('tier', event.target.value)} value={promotionDraft.tier}>
                          <option value="1">Tier 1</option>
                          <option value="2">Tier 2</option>
                          <option value="3">Tier 3</option>
                          <option value="4">Tier 4</option>
                          <option value="5">Tier 5</option>
                        </select>
                      </label>
                    ) : null}
                    {promotionTarget === 'question' ? (
                      <label>
                        <span>Urgency</span>
                        <select onChange={(event) => setPromotionField('urgency', event.target.value)} value={promotionDraft.urgency}>
                          <option value="tier3">Tier 3</option>
                          <option value="tier2">Tier 2</option>
                          <option value="tier1">Tier 1</option>
                          <option value="pinned">Pinned</option>
                        </select>
                      </label>
                    ) : null}
                    {promotionTarget === 'character' ? (
                      <label>
                        <span>Role</span>
                        <input onChange={(event) => setPromotionField('role', event.target.value)} value={promotionDraft.role} />
                      </label>
                    ) : null}
                    <label>
                      <span>{promotionTarget === 'question' ? 'Question' : 'Title'}</span>
                      <input onChange={(event) => setPromotionField('title', event.target.value)} value={promotionDraft.title} />
                    </label>
                    {promotionTarget === 'decision' ? (
                      <label>
                        <span>Decision question</span>
                        <input onChange={(event) => setPromotionField('question', event.target.value)} value={promotionDraft.question} />
                      </label>
                    ) : null}
                    <label>
                      <span>{promotionTarget === 'episode' ? 'Arc summary' : promotionTarget === 'location' ? 'Location summary' : 'Content'}</span>
                      <textarea onChange={(event) => setPromotionField('content', event.target.value)} value={promotionDraft.content} />
                    </label>
                  </div>

                  <div className="candidate-promotion-provenance">
                    <Info size={14} />
                    <span>{formatProvenance(selectedCandidate)}</span>
                  </div>
                  <div className="candidate-promotion-actions">
                    <button className="secondary-button" disabled={saving} onClick={() => setPromotionOpen(false)} type="button">Cancel</button>
                    <button className="primary-button" disabled={saving || !promotionDraft.title.trim()} onClick={promoteCandidate} type="button">
                      <Check size={14} />
                      <span>Create {promotionTargets.find(([value]) => value === promotionTarget)?.[1]}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="candidate-meta-grid">
                <div>
                  <strong>Suggested Links</strong>
                  <p>{formatSuggestedLinks(selectedCandidate.suggested_links)}</p>
                </div>
                <div>
                  <strong>Linked Canon</strong>
                  <p>{formatPromotions(selectedCandidate)}</p>
                </div>
                <div>
                  <strong>Notes</strong>
                  {editing ? (
                    <textarea
                      aria-label="Edit review notes"
                      className="candidate-notes-input"
                      onChange={(event) => updateEditDraft('notes', event.target.value)}
                      placeholder="Review notes"
                      value={editDraft.notes}
                    />
                  ) : (
                    <p>{selectedCandidate.notes || 'No review notes yet.'}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="candidate-empty-detail">Select a candidate to review.</div>
          )}
          {message ? <div className="candidate-message">{message}</div> : null}
        </section>
      </div>
    </section>
  );
}

function CandidateStatusBadge({ status }) {
  const label = normalizeCandidateStatusLabel(status);
  return <span className={`candidate-status ${statusClassName(label)}`}>{statusCopy[label]?.label || label}</span>;
}

function normalizeCandidateStatusLabel(status) {
  return statuses.includes(status) ? status : 'New';
}

function statusClassName(status) {
  return normalizeCandidateStatusLabel(status).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function formatProvenance(candidate) {
  const provenance = candidate.provenance_metadata || {};
  const source = provenance.source_id ? `${provenance.source} #${provenance.source_id}` : provenance.source;
  const date = formatDate(provenance.created_at || candidate.created_at);
  return `Created from ${source || 'unknown source'} using ${provenance.workflow || 'Candidate Inbox'} on ${date}.`;
}

function formatProvenanceSummary(candidate) {
  const provenance = candidate.provenance_metadata || {};
  return `${provenance.source || 'Manual'} / ${formatDate(candidate.created_at)}`;
}

function hasSourceSession(candidate) {
  const provenance = candidate?.provenance_metadata || {};
  return provenance.source === 'AI Session' && Boolean(provenance.source_id);
}

function formatSuggestedLinks(links = []) {
  return links.length ? links.map((link) => link.title || link.entity_id || 'Suggested record').join(', ') : 'None yet.';
}

function getCandidatePromotions(candidate) {
  const promotions = candidate?.provenance_metadata?.promotions;
  return Array.isArray(promotions) ? promotions.filter((promotion) => promotion?.target_type && promotion?.target_id) : [];
}

function formatPromotions(candidate) {
  const promotions = getCandidatePromotions(candidate);
  return promotions.length
    ? promotions.map((promotion) => `${promotion.target_label || 'Canon record'} #${promotion.target_id}`).join(', ')
    : 'No promoted canon record yet.';
}

function createPromotionDraft(candidate, target) {
  const title = candidate?.title || '';
  const content = candidate?.content || '';
  const base = {
    title,
    content,
    role: 'Candidate Promotion',
    parent_id: 'section-13',
    season: 1,
    episode_number: 1,
    tier: 5,
    urgency: 'tier3',
    question: ''
  };

  if (target === 'decision') {
    return {
      ...base,
      question: title.endsWith('?') ? title : ''
    };
  }

  return base;
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
