import { Check, Info, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';

const statuses = ['New', 'In Review', 'Promoted', 'Rejected'];

export default function CandidateInbox() {
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');
  const [draftType, setDraftType] = useState('Narrative Note');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const typeInputRef = useRef(null);
  const candidates = useRevivalStore((state) => state.candidates);
  const activeCandidateId = useRevivalStore((state) => state.activeCandidateId);
  const loadCandidates = useRevivalStore((state) => state.loadCandidates);
  const selectCandidate = useRevivalStore((state) => state.selectCandidate);
  const createCandidate = useRevivalStore((state) => state.createCandidate);
  const updateCandidateStatus = useRevivalStore((state) => state.updateCandidateStatus);
  const deleteCandidate = useRevivalStore((state) => state.deleteCandidate);
  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => String(candidate.id) === String(activeCandidateId)) || candidates[0] || null,
    [activeCandidateId, candidates]
  );

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    if (!activeCandidateId && candidates.length) {
      selectCandidate(candidates[0].id);
    }
  }, [activeCandidateId, candidates, selectCandidate]);

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

  const setStatus = async (status) => {
    if (!selectedCandidate || saving) return;

    setSaving(true);
    const response = await updateCandidateStatus({ id: selectedCandidate.id, status });
    setSaving(false);
    setMessage(response?.ok ? `Marked ${status}.` : response?.message || 'Status update failed.');
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

          <div className="candidate-list">
            {candidates.length ? candidates.map((candidate) => (
              <button
                className={`candidate-card ${String(selectedCandidate?.id) === String(candidate.id) ? 'selected' : ''}`}
                key={candidate.id}
                onClick={() => selectCandidate(candidate.id)}
                type="button"
              >
                <span className="candidate-card-topline">
                  <CandidateStatusBadge status={candidate.status} />
                  <span>{candidate.type || 'Narrative Note'}</span>
                </span>
                <strong>{candidate.title}</strong>
                <span>{candidate.content || 'No content yet.'}</span>
              </button>
            )) : (
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
                  <span className="selection-kicker">{selectedCandidate.type || 'Narrative Note'}</span>
                  <h2>{selectedCandidate.title}</h2>
                </div>
                <CandidateStatusBadge status={selectedCandidate.status} />
              </div>

              <div className="candidate-content">
                <p>{selectedCandidate.content || 'No candidate content has been added yet.'}</p>
              </div>

              <div className="candidate-actions" aria-label="Candidate status actions">
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'In Review'} onClick={() => setStatus('In Review')} type="button">
                  In Review
                </button>
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'Promoted'} onClick={() => setStatus('Promoted')} type="button">
                  <Check size={14} />
                  <span>Promote</span>
                </button>
                <button className="secondary-button" disabled={saving || selectedCandidate.status === 'Rejected'} onClick={() => setStatus('Rejected')} type="button">
                  <X size={14} />
                  <span>Reject</span>
                </button>
                <button className="secondary-button danger-button candidate-delete-button" disabled={saving} onClick={removeCandidate} type="button">
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>

              <div className="candidate-provenance">
                <span>Provenance</span>
                <Info size={14} title={formatProvenance(selectedCandidate)} />
                <small>{formatProvenanceSummary(selectedCandidate)}</small>
              </div>

              <div className="candidate-meta-grid">
                <div>
                  <strong>Suggested Links</strong>
                  <p>{formatSuggestedLinks(selectedCandidate.suggested_links)}</p>
                </div>
                <div>
                  <strong>Notes</strong>
                  <p>{selectedCandidate.notes || 'No review notes yet.'}</p>
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
  const label = statuses.includes(status) ? status : 'New';
  return <span className={`candidate-status ${label.toLowerCase().replace(/\s+/g, '-')}`}>{label}</span>;
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

function formatSuggestedLinks(links = []) {
  return links.length ? links.map((link) => link.title || link.entity_id || 'Suggested record').join(', ') : 'None yet.';
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
}
