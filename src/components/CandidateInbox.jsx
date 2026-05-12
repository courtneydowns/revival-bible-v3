import { Check, ExternalLink, Info, Plus, Send, SlidersHorizontal, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';

const acceptedStatus = 'Accepted / Needs Placement';
const statuses = ['New', 'In Review', acceptedStatus, 'Promoted', 'Rejected'];
const reviewStateOptions = ['New', 'In Review', acceptedStatus, 'Rejected'];
const statusAliases = {
  accepted: acceptedStatus,
  acceptedandneedsplacement: acceptedStatus,
  acceptedneedsplacement: acceptedStatus,
  inreview: 'In Review',
  needsplacement: acceptedStatus,
  new: 'New',
  pending: 'New',
  promoted: 'Promoted',
  rejected: 'Rejected'
};
const statusFilters = [
  ['All', 'All candidates'],
  ['Pending', 'Pending'],
  [acceptedStatus, 'Needs placement'],
  ['Promoted', 'Promoted'],
  ['Rejected', 'Rejected']
];
const commonTagFilters = [
  'contradiction-risk',
  'canon',
  'developing',
  'character',
  'timeline',
  'relationship',
  'episode',
  'decision',
  'question',
  'location',
  'unresolved'
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
const candidateRecoveryStorageKey = 'revival-candidate-edit-drafts';

export default function CandidateInbox() {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftType, setDraftType] = useState('Narrative Note');
  const [editDraft, setEditDraft] = useState({ title: '', content: '', type: 'Narrative Note', notes: '' });
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tagFilter, setTagFilter] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionTarget, setPromotionTarget] = useState('character');
  const [promotionDraft, setPromotionDraft] = useState(createPromotionDraft(null, 'character'));
  const [candidateTagDraft, setCandidateTagDraft] = useState('');
  const [metadataMessage, setMetadataMessage] = useState('');
  const [deleteCandidateTarget, setDeleteCandidateTarget] = useState(null);
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const typeInputRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const filterRef = useRef(null);
  const candidates = useRevivalStore((state) => state.candidates);
  const databasePath = useRevivalStore((state) => state.databaseInfo.path);
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
  const filteredCandidates = useMemo(
    () => candidates.filter((candidate) => matchesCandidateFilter(candidate, statusFilter, tagFilter)),
    [candidates, statusFilter, tagFilter]
  );
  const hasActiveFilters = statusFilter !== 'All' || Boolean(tagFilter);
  const selectedCandidate = useMemo(() => {
    const activeInFiltered = filteredCandidates.find((candidate) => String(candidate.id) === String(activeCandidateId));
    if (activeInFiltered) return activeInFiltered;
    if (hasActiveFilters) return filteredCandidates[0] || null;
    return candidates.find((candidate) => String(candidate.id) === String(activeCandidateId)) || candidates[0] || null;
  }, [activeCandidateId, candidates, filteredCandidates, hasActiveFilters]);
  const queueCounts = useMemo(() => {
    const counts = Object.fromEntries(statusFilters.map(([status]) => [status, 0]));
    candidates.forEach((candidate) => {
      const status = normalizeCandidateStatusLabel(candidate.status);
      counts.All += 1;
      if (status === 'New' || status === 'In Review') counts.Pending += 1;
      if (status === acceptedStatus) counts[acceptedStatus] += 1;
      if (status === 'Promoted') counts.Promoted += 1;
      if (status === 'Rejected') counts.Rejected += 1;
    });
    return counts;
  }, [candidates]);
  const tagOptions = useMemo(() => getTagOptions(candidates), [candidates]);
  const activeQueueCount = (queueCounts.Pending || 0) + (queueCounts[acceptedStatus] || 0);
  const traceableQueueCount = useMemo(
    () => candidates.filter(hasTraceableProvenance).length,
    [candidates]
  );
  const selectedFilterSummary = getFilterSummary(statusFilter, tagFilter, filteredCandidates.length);
  const selectedManualTags = useMemo(() => getExplicitCandidateTags(selectedCandidate), [selectedCandidate]);
  const candidateTagDraftSlug = normalizeTagValue(candidateTagDraft);
  const candidateTagIsDuplicate = Boolean(
    candidateTagDraftSlug && selectedManualTags.some((tag) => tag.slug === candidateTagDraftSlug)
  );

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    if (!activeCandidateId && candidates.length) {
      selectCandidate(candidates[0].id);
    }
  }, [activeCandidateId, candidates, selectCandidate]);

  useEffect(() => {
    if (!filteredCandidates.length) return;
    if (filteredCandidates.some((candidate) => String(candidate.id) === String(activeCandidateId))) return;
    selectCandidate(filteredCandidates[0].id);
  }, [activeCandidateId, filteredCandidates, selectCandidate]);

  useEffect(() => {
    if (!filterOpen) return undefined;

    const closeFilter = (event) => {
      if (event.key === 'Escape' || (event.type === 'mousedown' && !filterRef.current?.contains(event.target))) {
        setFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', closeFilter);
    document.addEventListener('keydown', closeFilter);

    return () => {
      document.removeEventListener('mousedown', closeFilter);
      document.removeEventListener('keydown', closeFilter);
    };
  }, [filterOpen]);

  useEffect(() => {
    if (!selectedCandidate) {
      setEditing(false);
      setEditDraft({ title: '', content: '', type: 'Narrative Note', notes: '' });
      setAutoSaveStatus('');
      return;
    }

    const recoveredDraft = getCandidateRecoveryDraft(databasePath, selectedCandidate.id);
    const shouldRecoverDraft = recoveredDraft && !candidateDraftsEqual(recoveredDraft, selectedCandidate);
    setEditing(false);
    setEditDraft(shouldRecoverDraft ? recoveredDraft : {
      title: selectedCandidate.title || '',
      content: selectedCandidate.content || '',
      type: selectedCandidate.type || 'Narrative Note',
      notes: selectedCandidate.notes || ''
    });
    setAutoSaveStatus(shouldRecoverDraft ? 'Recovered unsaved edits' : '');
    if (shouldRecoverDraft) setEditing(true);
    setPromotionOpen(false);
    setPromotionTarget('character');
    setPromotionDraft(createPromotionDraft(selectedCandidate, 'character'));
    setCandidateTagDraft('');
    setMetadataMessage('');
  }, [databasePath, selectedCandidate?.id]);

  useEffect(() => {
    if (!editing || !selectedCandidate) return undefined;

    if (!hasCandidateDraftChanges(editDraft, selectedCandidate)) {
      removeCandidateRecoveryDraft(databasePath, selectedCandidate.id);
      setAutoSaveStatus('');
      return undefined;
    }

    persistCandidateRecoveryDraft(databasePath, selectedCandidate.id, editDraft);
    setAutoSaveStatus(editDraft.title.trim() ? 'Unsaved changes' : 'Title required to save');

    if (!editDraft.title.trim()) return undefined;

    if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = window.setTimeout(async () => {
      setAutoSaveStatus('Saving...');
      const response = await updateCandidate({
        id: selectedCandidate.id,
        title: editDraft.title,
        content: editDraft.content,
        type: editDraft.type,
        notes: editDraft.notes
      });

      if (response?.ok) {
        removeCandidateRecoveryDraft(databasePath, selectedCandidate.id);
        setAutoSaveStatus('Saved');
      } else {
        setAutoSaveStatus('Recovery draft saved locally');
      }
    }, 900);

    return () => {
      if (autoSaveTimerRef.current) window.clearTimeout(autoSaveTimerRef.current);
    };
  }, [databasePath, editDraft, editing, selectedCandidate, updateCandidate]);

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
    removeCandidateRecoveryDraft(databasePath, selectedCandidate.id);
    setEditDraft({
      title: selectedCandidate.title || '',
      content: selectedCandidate.content || '',
      type: selectedCandidate.type || 'Narrative Note',
      notes: selectedCandidate.notes || ''
    });
    setEditing(false);
    setAutoSaveStatus('');
  };

  const saveCandidate = async () => {
    if (!selectedCandidate || saving || !editDraft.title.trim()) return;

    setSaving(true);
    const response = await updateCandidate({
      id: selectedCandidate.id,
      title: editDraft.title,
      content: editDraft.content,
      type: editDraft.type,
      notes: editDraft.notes,
      tags: getExplicitCandidateTags(selectedCandidate)
    });
    setSaving(false);

    if (response?.ok) {
      removeCandidateRecoveryDraft(databasePath, selectedCandidate.id);
      setEditing(false);
      setAutoSaveStatus('Saved');
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

  const updateCandidateTags = async (nextTags) => {
    if (!selectedCandidate || saving) return;

    setSaving(true);
    setMetadataMessage('');
    const response = await updateCandidate({
      id: selectedCandidate.id,
      title: selectedCandidate.title,
      content: selectedCandidate.content,
      type: selectedCandidate.type,
      notes: selectedCandidate.notes,
      tags: nextTags
    });
    setSaving(false);
    setMetadataMessage(response?.ok ? 'Tags saved.' : response?.message || 'Tag update failed.');
  };

  const addCandidateTag = async (event) => {
    event.preventDefault();
    const slug = normalizeTagValue(candidateTagDraft);
    if (!slug || !selectedCandidate || saving) return;

    const currentTags = getExplicitCandidateTags(selectedCandidate);
    if (currentTags.some((tag) => tag.slug === slug)) {
      setMetadataMessage('Tag is already assigned.');
      return;
    }

    await updateCandidateTags([...currentTags, { slug, label: formatTagLabel(slug) }]);
    setCandidateTagDraft('');
  };

  const removeCandidateTag = async (tagSlug) => {
    if (!selectedCandidate || saving) return;
    const slug = normalizeTagValue(tagSlug);
    await updateCandidateTags(getExplicitCandidateTags(selectedCandidate).filter((tag) => tag.slug !== slug));
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

  const requestCandidateDelete = () => {
    if (!selectedCandidate || saving) return;
    setDeleteCandidateTarget({
      id: selectedCandidate.id,
      status: normalizeCandidateStatusLabel(selectedCandidate.status),
      title: selectedCandidate.title
    });
  };

  const cancelCandidateDelete = () => {
    if (saving) return;
    setDeleteCandidateTarget(null);
  };

  const confirmCandidateDelete = async () => {
    if (!deleteCandidateTarget || saving) return;

    const candidateId = deleteCandidateTarget.id;
    setSaving(true);
    removeCandidateRecoveryDraft(databasePath, candidateId);
    setEditing(false);
    setPromotionOpen(false);
    setMetadataMessage('');
    setCandidateTagDraft('');
    const response = await deleteCandidate(candidateId);
    setSaving(false);
    setDeleteCandidateTarget(null);
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
          <div className={`candidate-create ${createOpen ? 'open' : ''}`}>
            <div className="candidate-create-heading">
              <div>
                <strong>New Candidate</strong>
                {createOpen ? <span>Preserved until reviewed.</span> : null}
              </div>
              <button className="secondary-button" onClick={() => setCreateOpen((open) => !open)} type="button">
                <Plus size={14} />
                <span>{createOpen ? 'Close' : 'New'}</span>
              </button>
            </div>
            {createOpen ? (
              <form className="candidate-create-form" onSubmit={addCandidate}>
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
            ) : null}
          </div>

          <div className="candidate-filter" ref={filterRef}>
            <div className="candidate-filter-summary" aria-live="polite">
              <strong>{filteredCandidates.length}</strong>
              <span>{selectedFilterSummary}</span>
            </div>
            <div className="candidate-filter-control">
              <div className="candidate-filter-pills">
                {statusFilter === 'All' && !tagFilter ? (
                  <span className="candidate-filter-none">No filters applied</span>
                ) : null}
                {statusFilter !== 'All' ? (
                  <button
                    className={`candidate-filter-pill ${statusClassName(statusFilter)}`}
                    onClick={() => setFilterOpen((open) => !open)}
                    type="button"
                  >
                    {getFilterLabel(statusFilter)}
                  </button>
                ) : null}
                {tagFilter ? (
                  <button className={`candidate-filter-pill tag ${tagColorClass(tagFilter)}`} onClick={() => setTagFilter('')} type="button">
                    <span>{formatTagLabel(tagFilter)}</span>
                    <X size={11} />
                  </button>
                ) : null}
              </div>
              {hasActiveFilters ? (
                <button className="candidate-filter-clear" onClick={() => {
                  setStatusFilter('All');
                  setTagFilter('');
                  setFilterOpen(false);
                }} type="button">
                  Clear
                </button>
              ) : null}
              <button
                aria-expanded={filterOpen}
                aria-haspopup="menu"
                className="secondary-button candidate-filter-button"
                onClick={() => setFilterOpen((open) => !open)}
                type="button"
              >
                <SlidersHorizontal size={13} />
                <span>Metadata</span>
              </button>
              {filterOpen ? (
                <div className="candidate-filter-menu" role="menu">
                  <div className="candidate-filter-title">
                    <strong>Metadata Filters</strong>
                    <span>Status and manual tags</span>
                  </div>
                  <div className="candidate-filter-menu-section candidate-filter-menu-heading">
                    <span>Review State</span>
                    {hasActiveFilters ? (
                      <button onClick={() => {
                        setStatusFilter('All');
                        setTagFilter('');
                        setFilterOpen(false);
                      }} type="button">Clear all</button>
                    ) : null}
                  </div>
                  {statusFilters.map(([status, label]) => (
                    <button
                      className={statusFilter === status ? 'selected' : ''}
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterOpen(false);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <span>{status === 'All' ? label : getFilterLabel(status)}</span>
                      <strong>{queueCounts[status] || 0}</strong>
                    </button>
                  ))}
                  <div className="candidate-filter-menu-section">
                    <span>Manual Tags</span>
                    {tagFilter ? (
                      <button onClick={() => setTagFilter('')} type="button">Clear</button>
                    ) : null}
                  </div>
                  {tagOptions.length ? tagOptions.map((tag) => (
                    <button
                      className={normalizeTagValue(tagFilter) === tag.slug ? 'selected' : ''}
                      key={tag.slug}
                      onClick={() => {
                        setTagFilter(tag.slug);
                        setFilterOpen(false);
                      }}
                      role="menuitem"
                      type="button"
                    >
                      <span className={`candidate-tag ${tagColorClass(tag.slug)}`}>{tag.label}</span>
                      <strong>{tag.count}</strong>
                    </button>
                  )) : (
                    <div className="candidate-filter-menu-empty">No candidate tags yet.</div>
                  )}
                </div>
              ) : null}
            </div>
            <div className="candidate-queue-summary" aria-label="Candidate queue totals">
              {activeQueueCount} active <span aria-hidden="true">·</span> {traceableQueueCount} traceable
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
                {getCandidateTags(candidate).length ? (
                  <span className="candidate-card-tags">
                    {getCandidateTags(candidate).slice(0, 3).map((tag) => (
                      <span className={`candidate-tag ${tagColorClass(tag.slug)}`} key={tag.slug}>{tag.label}</span>
                    ))}
                  </span>
                ) : null}
                <span className="candidate-card-state">{statusCopy[normalizeCandidateStatusLabel(candidate.status)]?.summary}</span>
                <span>{candidate.content || 'No content yet.'}</span>
              </button>
            )) : candidates.length ? (
              <div className="candidate-empty-state">
                <strong>No matching candidates.</strong>
                <span>{formatEmptyFilterMessage(statusFilter, tagFilter)}</span>
              </div>
            ) : (
              <div className="candidate-empty-state">
                <strong>No candidates yet.</strong>
                <span>Add a manual test candidate to start the review queue.</span>
                <button className="secondary-button" onClick={() => {
                  setCreateOpen(true);
                  window.requestAnimationFrame(() => titleInputRef.current?.focus());
                }} type="button">
                  <Plus size={14} />
                  <span>New Candidate</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        <section className="candidate-detail-panel" aria-label="Candidate detail" key={selectedCandidate?.id || 'empty-candidate'}>
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
                {autoSaveStatus ? <span className="save-state-text" role="status">{autoSaveStatus}</span> : null}
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'In Review'} onClick={() => setStatus('In Review')} type="button">
                  In Review
                </button>
                  <button className="secondary-button" disabled={saving || selectedCandidate.status === acceptedStatus} onClick={() => setStatus(acceptedStatus)} type="button">
                    <Check size={14} />
                    <span>Accept</span>
                  </button>
                  <button className="secondary-button" disabled={saving || editing} onClick={openPromotionReview} type="button">
                    <Send size={14} />
                    <span>Promote</span>
                  </button>
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'Rejected'} onClick={() => setStatus('Rejected')} type="button">
                  <X size={14} />
                  <span>Reject</span>
                </button>
                <button
                  className="secondary-button danger-button candidate-delete-button"
                  disabled={saving}
                  onClick={requestCandidateDelete}
                  title={normalizeCandidateStatusLabel(selectedCandidate.status) === 'Promoted' ? 'Promoted candidates are protected' : 'Delete candidate'}
                  type="button"
                >
                  <Trash2 size={14} />
                  <span>{normalizeCandidateStatusLabel(selectedCandidate.status) === 'Promoted' ? 'Protected' : 'Delete'}</span>
                </button>
              </div>

              {selectedCandidate.status === acceptedStatus ? (
                <div className="candidate-acceptance-note">
                  <strong>Accepted.</strong>
                  <span>Needs a placement decision later; not canon until explicitly promoted.</span>
                </div>
              ) : null}

              <section className="candidate-metadata-editor" aria-label="Candidate metadata editor">
                <div className="candidate-metadata-heading">
                  <div>
                    <strong>Editorial Metadata</strong>
                    <span>Tags and review state stay manual. Canon changes require promotion.</span>
                  </div>
                  <details>
                    <summary>Allowed values</summary>
                    <p><strong>Status:</strong> Pending, In Review, Needs Placement, Rejected. Promotion uses the explicit promotion action.</p>
                    <p><strong>Tags:</strong> Short editorial labels such as contradiction-risk, character, timeline, episode, decision, question, location, or maybe-later.</p>
                  </details>
                </div>
                <label className="candidate-status-select">
                  <span>Review State</span>
                  <select disabled={saving || normalizeCandidateStatusLabel(selectedCandidate.status) === 'Promoted'} onChange={(event) => setStatus(event.target.value)} value={normalizeCandidateStatusLabel(selectedCandidate.status)}>
                    {(normalizeCandidateStatusLabel(selectedCandidate.status) === 'Promoted' ? statuses : reviewStateOptions).map((status) => (
                      <option key={status} value={status}>{statusCopy[status]?.label || status}</option>
                    ))}
                  </select>
                </label>
                <div className="candidate-tag-editor">
                  <span>Manual Tags</span>
                  <div className="editable-tag-row">
                    {selectedManualTags.length ? selectedManualTags.map((tag) => (
                      <span className={`candidate-tag editable ${tagColorClass(tag.slug)}`} key={tag.slug}>
                        {tag.label}
                        <button aria-label={`Remove ${tag.label}`} disabled={saving} onClick={() => removeCandidateTag(tag.slug)} title={`Remove ${tag.label}`} type="button">
                          <X size={12} />
                        </button>
                      </span>
                    )) : <span className="muted small-note">No manual tags assigned.</span>}
                  </div>
                  <form className="candidate-tag-add-row" onSubmit={addCandidateTag}>
                    <input
                      disabled={saving}
                      list={`candidate-tag-options-${selectedCandidate.id}`}
                      onChange={(event) => {
                        setCandidateTagDraft(event.target.value);
                        setMetadataMessage('');
                      }}
                      placeholder="Add manual tag"
                      value={candidateTagDraft}
                    />
                    <datalist id={`candidate-tag-options-${selectedCandidate.id}`}>
                      {getCandidateTagSuggestions(selectedCandidate).map((tag) => (
                        <option key={tag} value={tag}>{formatTagLabel(tag)}</option>
                      ))}
                    </datalist>
                    <button className="secondary-button" disabled={saving || !candidateTagDraftSlug || candidateTagIsDuplicate} title={candidateTagIsDuplicate ? 'Tag already assigned' : 'Add tag'} type="submit">
                      <Plus size={15} />
                      <span>Add Tag</span>
                    </button>
                  </form>
                  {candidateTagIsDuplicate ? <p className="candidate-inline-note">Already assigned.</p> : null}
                </div>
                {metadataMessage ? <p className="editor-message">{metadataMessage}</p> : null}
              </section>

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
                  <strong>Tags</strong>
                  {getCandidateTags(selectedCandidate).length ? (
                    <div className="candidate-detail-tags">
                      {getCandidateTags(selectedCandidate).map((tag) => (
                        <button className={`candidate-tag ${tagColorClass(tag.slug)}`} key={tag.slug} onClick={() => setTagFilter(tag.slug)} type="button">
                          {tag.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p>No candidate tags yet.</p>
                  )}
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

      {deleteCandidateTarget ? (
        <div className="modal-backdrop">
          <section aria-labelledby="candidate-delete-title" aria-modal="true" className="modal candidate-delete-modal" role="dialog">
            <div className="candidate-delete-modal-header">
              <div>
                <div className="eyebrow">Delete Candidate</div>
                <h2 id="candidate-delete-title">Remove this candidate?</h2>
              </div>
              <button className="icon-button" disabled={saving} onClick={cancelCandidateDelete} title="Cancel delete" type="button">
                <X size={16} />
              </button>
            </div>
            <p>
              {deleteCandidateTarget.status === 'Promoted' ? (
                <>
                  <strong>{deleteCandidateTarget.title}</strong> has already been promoted, so it is preserved as provenance for the canon record.
                </>
              ) : (
                <>
                  This permanently deletes <strong>{deleteCandidateTarget.title}</strong> from the candidate queue.
                  Rejected candidates can stay preserved instead; promoted candidates remain protected.
                </>
              )}
            </p>
            <div className="modal-actions">
              <button className="secondary-button" disabled={saving} onClick={cancelCandidateDelete} type="button">
                {deleteCandidateTarget.status === 'Promoted' ? 'Close' : 'Cancel'}
              </button>
              {deleteCandidateTarget.status === 'Promoted' ? null : (
                <button className="secondary-button danger-button" disabled={saving} onClick={confirmCandidateDelete} type="button">
                  <Trash2 size={14} />
                  <span>{saving ? 'Deleting...' : 'Delete Candidate'}</span>
                </button>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}

function CandidateStatusBadge({ status }) {
  const label = normalizeCandidateStatusLabel(status);
  return <span className={`candidate-status ${statusClassName(label)}`}>{statusCopy[label]?.label || label}</span>;
}

function normalizeCandidateStatusLabel(status) {
  if (statuses.includes(status)) return status;

  const normalizedStatus = String(status || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '');

  return statusAliases[normalizedStatus] || 'New';
}

function matchesCandidateFilter(candidate, filter, tagFilter = '') {
  const statusMatches = filter === 'All' || matchesStatusFilter(candidate, filter);
  if (!statusMatches) return false;

  const normalizedTagFilter = normalizeTagValue(tagFilter);
  if (!normalizedTagFilter) return true;

  return getCandidateTags(candidate).some((tag) => tag.slug === normalizedTagFilter);
}

function matchesStatusFilter(candidate, filter) {
  if (filter === 'All') return true;

  const status = normalizeCandidateStatusLabel(candidate?.status);
  if (filter === 'Pending') return status === 'New' || status === 'In Review';
  return status === filter;
}

function getFilterLabel(filter) {
  if (filter === 'All') return 'All';
  if (filter === 'Pending') return 'Pending';
  return statusCopy[filter]?.label || filter;
}

function getFilterSummary(filter, tagFilter = '', count = 0) {
  const statusSummary = filter === 'All'
    ? 'All candidate statuses.'
    : filter === 'Pending'
      ? 'Pending and in-review candidates.'
      : statusCopy[filter]?.summary || 'Filtered candidate queue.';
  const tagSummary = tagFilter ? ` Tag: ${formatTagLabel(tagFilter)}.` : '';
  return `${statusSummary}${tagSummary} ${count} shown.`;
}

function statusClassName(status) {
  return normalizeCandidateStatusLabel(status).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function getTagOptions(candidates = []) {
  const tagCounts = new Map();

  candidates.forEach((candidate) => {
    getCandidateTags(candidate).forEach((tag) => {
      const current = tagCounts.get(tag.slug) || { ...tag, count: 0 };
      current.count += 1;
      tagCounts.set(tag.slug, current);
    });
  });

  commonTagFilters.forEach((tagValue) => {
    const normalized = normalizeTagValue(tagValue);
    if (!tagCounts.has(normalized)) {
      tagCounts.set(normalized, {
        slug: normalized,
        label: formatTagLabel(normalized),
        count: 0,
        synthetic: true
      });
    }
  });

  return [...tagCounts.values()]
    .filter((tag) => tag.count > 0 || !tag.synthetic)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function getCandidateTags(candidate = {}) {
  const tags = new Map();
  const addTag = (value, label = '') => {
    const normalized = normalizeTagValue(value || label);
    if (!normalized) return;
    tags.set(normalized, {
      slug: normalized,
      label: label || formatTagLabel(normalized)
    });
  };

  [
    candidate.tags,
    candidate.canon_tags,
    candidate.matched_tags,
    candidate.provenance_metadata?.tags,
    candidate.provenance_metadata?.canon_tags
  ].forEach((tagList) => {
    if (!Array.isArray(tagList)) return;
    tagList.forEach((tag) => {
      if (typeof tag === 'string') {
        addTag(tag);
      } else if (tag) {
        addTag(tag.slug || tag.value || tag.name || tag.label, tag.label || tag.name || '');
      }
    });
  });

  (Array.isArray(candidate.suggested_links) ? candidate.suggested_links : []).forEach((link) => {
    addTag(link.entity_type || link.type);
    if (Array.isArray(link.tags)) {
      link.tags.forEach((tag) => addTag(tag.slug || tag.label || tag));
    }
  });

  getCandidatePromotions(candidate).forEach((promotion) => {
    addTag(promotion.requested_target || promotion.target_type);
  });

  const type = String(candidate.type || '').toLowerCase();
  if (type.includes('character')) addTag('character');
  if (type.includes('timeline')) addTag('timeline');
  if (type.includes('question')) addTag('question');
  if (type.includes('decision')) addTag('decision');
  if (type.includes('location')) addTag('location');
  if (type.includes('episode')) addTag('episode');

  const content = `${candidate.title || ''} ${candidate.content || ''} ${candidate.notes || ''}`.toLowerCase();
  commonTagFilters.forEach((tagValue) => {
    const normalized = normalizeTagValue(tagValue);
    const spaced = normalized.replace(/-/g, ' ');
    if (content.includes(tagValue) || content.includes(spaced)) addTag(normalized);
  });

  if (normalizeCandidateStatusLabel(candidate.status) === acceptedStatus) addTag('developing');
  if (normalizeCandidateStatusLabel(candidate.status) === 'Promoted') addTag('canon');

  return [...tags.values()];
}

function getExplicitCandidateTags(candidate = {}) {
  const tags = candidate?.provenance_metadata?.tags;
  if (!Array.isArray(tags)) return [];

  const seen = new Set();
  return tags.map((tag) => {
    const slug = normalizeTagValue(typeof tag === 'string' ? tag : tag?.slug || tag?.label || tag?.name);
    if (!slug || seen.has(slug)) return null;
    seen.add(slug);
    return {
      slug,
      label: typeof tag === 'object' && tag?.label ? tag.label : formatTagLabel(slug)
    };
  }).filter(Boolean);
}

function getCandidateTagSuggestions(candidate = {}) {
  const current = new Set(getExplicitCandidateTags(candidate).map((tag) => tag.slug));
  const derived = getCandidateTags(candidate).map((tag) => tag.slug);
  return [...new Set([...commonTagFilters, ...derived, 'maybe-later', 'alternate-version', 'future-episode'])]
    .filter((tag) => !current.has(tag))
    .slice(0, 24);
}

function normalizeTagValue(value = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/^-+|-+$/g, '');

  if (normalized === 'contradictionrisk') return 'contradiction-risk';
  return normalized;
}

function formatTagLabel(value = '') {
  const normalized = normalizeTagValue(value);
  if (!normalized) return 'Tag';
  if (normalized === 'contradiction-risk') return 'Contradiction Risk';
  return normalized.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
}

function tagColorClass(value = '') {
  const tag = normalizeTagValue(value);
  if (tag.includes('contradiction') || tag.includes('risk') || tag.includes('unresolved')) return 'color-risk';
  if (tag.includes('canon') || tag.includes('promoted')) return 'color-canon';
  if (tag.includes('character')) return 'color-character';
  if (tag.includes('timeline')) return 'color-timeline';
  if (tag.includes('location')) return 'color-location';
  if (tag.includes('episode')) return 'color-episode';
  if (tag.includes('bible') || tag.includes('section')) return 'color-section';
  if (tag.includes('relationship')) return 'color-relationship';
  if (tag.includes('question')) return 'color-question';
  if (tag.includes('decision')) return 'color-decision';
  if (tag.includes('developing')) return 'color-developing';
  return 'color-default';
}

function formatEmptyFilterMessage(statusFilter, tagFilter) {
  const statusText = statusFilter === 'All' ? 'all statuses' : getFilterLabel(statusFilter).toLowerCase();
  const tagText = tagFilter ? ` tagged ${formatTagLabel(tagFilter)}` : '';
  return `No ${statusText}${tagText} candidates match right now. Clear or change filters to review another queue.`;
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

function hasTraceableProvenance(candidate) {
  const provenance = candidate?.provenance_metadata || {};
  return Boolean(
    provenance.source_id
    || provenance.source_session_id
    || provenance.source_passage
    || provenance.source_range
    || provenance.source_title
    || getCandidatePromotions(candidate).length
    || (Array.isArray(candidate?.suggested_links) && candidate.suggested_links.length)
  );
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
  return formatCentralTime(value, { fallback: 'Unknown date', dateStyle: 'medium', timeStyle: 'short' });
}

function getCandidateRecoveryDrafts() {
  if (typeof localStorage === 'undefined') return {};

  try {
    return JSON.parse(localStorage.getItem(candidateRecoveryStorageKey) || '{}');
  } catch {
    return {};
  }
}

function getCandidateRecoveryDraft(databasePath, candidateId) {
  const draft = getCandidateRecoveryDrafts()[getCandidateRecoveryKey(databasePath, candidateId)];
  if (!draft) return null;

  return {
    title: String(draft.title || ''),
    content: String(draft.content || ''),
    type: String(draft.type || 'Narrative Note'),
    notes: String(draft.notes || '')
  };
}

function persistCandidateRecoveryDraft(databasePath, candidateId, draft) {
  if (typeof localStorage === 'undefined' || !candidateId) return;

  localStorage.setItem(candidateRecoveryStorageKey, JSON.stringify({
    ...getCandidateRecoveryDrafts(),
    [getCandidateRecoveryKey(databasePath, candidateId)]: {
      title: draft.title,
      content: draft.content,
      type: draft.type,
      notes: draft.notes,
      updatedAt: new Date().toISOString()
    }
  }));
}

function removeCandidateRecoveryDraft(databasePath, candidateId) {
  if (typeof localStorage === 'undefined' || !candidateId) return;

  const drafts = getCandidateRecoveryDrafts();
  delete drafts[getCandidateRecoveryKey(databasePath, candidateId)];
  localStorage.setItem(candidateRecoveryStorageKey, JSON.stringify(drafts));
}

function getCandidateRecoveryKey(databasePath, candidateId) {
  return `${databasePath || 'local'}:${candidateId}`;
}

function hasCandidateDraftChanges(draft, candidate) {
  return !candidateDraftsEqual(draft, candidate);
}

function candidateDraftsEqual(draft, candidate) {
  return String(draft?.title || '') === String(candidate?.title || '')
    && String(draft?.content || '') === String(candidate?.content || '')
    && String(draft?.type || 'Narrative Note') === String(candidate?.type || 'Narrative Note')
    && String(draft?.notes || '') === String(candidate?.notes || '');
}
