import { FilePlus2, Flag, GitCompareArrows, Layers3, Plus, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';
import StatusBadge from './StatusBadge.jsx';

const initialSessionDraft = {
  title: '',
  sourceType: 'manual',
  notes: '',
  provenanceNote: ''
};

const initialCandidateDraft = {
  importSessionId: '',
  sourceLabel: '',
  sourceType: 'note',
  rawContent: '',
  title: '',
  content: '',
  classification: 'candidate',
  confidenceState: 'weak',
  trustReason: '',
  flagDuplicate: false,
  duplicateReason: '',
  flagContradiction: false,
  contradictionClaim: ''
};

export default function EditorialIngestion() {
  const [sessionDraft, setSessionDraft] = useState(initialSessionDraft);
  const [candidateDraft, setCandidateDraft] = useState(initialCandidateDraft);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const ingestionReviewSummary = useRevivalStore((state) => state.ingestionReviewSummary);
  const createImportSession = useRevivalStore((state) => state.createImportSession);
  const createManualExtractionCandidate = useRevivalStore((state) => state.createManualExtractionCandidate);
  const sessions = ingestionReviewSummary.sessions || [];
  const stagedItems = useMemo(() => [
    ...(ingestionReviewSummary.unresolvedExtractions || []).map((item) => ({
      key: `extraction-${item.id}`,
      title: item.title,
      meta: `${formatReviewType(item.classification)} / ${item.source_label || 'Source preserved'}`,
      status: item.confidence_state || item.status,
      timestamp: item.updated_at || item.created_at
    })),
    ...(ingestionReviewSummary.narrativeFragments || []).map((item) => ({
      key: `fragment-${item.id}`,
      title: item.title,
      meta: `${formatReviewType(item.fragment_type)} / Non-canon fragment`,
      status: item.confidence_state || item.status,
      timestamp: item.updated_at || item.created_at
    })),
    ...(ingestionReviewSummary.duplicateReviews || []).map((item) => ({
      key: `duplicate-${item.id}`,
      title: 'Possible duplicate',
      meta: item.reason || 'Manual duplicate review',
      status: item.confidence || item.status,
      timestamp: item.updated_at || item.created_at
    })),
    ...(ingestionReviewSummary.continuityReviews || []).map((item) => ({
      key: `continuity-${item.id}`,
      title: item.title,
      meta: 'Continuity review',
      status: item.confidence_state || item.risk_level,
      timestamp: item.updated_at || item.created_at
    }))
  ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()).slice(0, 10), [ingestionReviewSummary]);

  const updateSessionDraft = (field, value) => setSessionDraft((draft) => ({ ...draft, [field]: value }));
  const updateCandidateDraft = (field, value) => setCandidateDraft((draft) => ({ ...draft, [field]: value }));

  const saveSession = async (event) => {
    event.preventDefault();
    if (!sessionDraft.title.trim() || !sessionDraft.provenanceNote.trim()) {
      setMessage('Session title and provenance note are required.');
      return;
    }

    setSaving(true);
    const response = await createImportSession({
      title: sessionDraft.title,
      sourceType: sessionDraft.sourceType,
      notes: sessionDraft.notes,
      provenanceMetadata: {
        workflow: 'Editorial Ingestion',
        source_note: sessionDraft.provenanceNote,
        preserved: true,
        memory_layer: 'source'
      }
    });
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Import session could not be saved.');
      return;
    }

    setCandidateDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSessionDraft(initialSessionDraft);
    setMessage('Import session saved. Staged material remains non-canon.');
  };

  const saveCandidate = async (event) => {
    event.preventDefault();
    if (!candidateDraft.importSessionId || !candidateDraft.sourceLabel.trim() || !candidateDraft.rawContent.trim() || !candidateDraft.title.trim() || !candidateDraft.content.trim() || !candidateDraft.trustReason.trim()) {
      setMessage('Session, provenance, source text, candidate title, candidate content, and trust note are required.');
      return;
    }

    setSaving(true);
    const response = await createManualExtractionCandidate(candidateDraft);
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Staged material could not be saved.');
      return;
    }

    setCandidateDraft((draft) => ({
      ...initialCandidateDraft,
      importSessionId: draft.importSessionId,
      sourceType: draft.sourceType
    }));
    setMessage('Staged material saved for manual review. Canon counts are untouched.');
  };

  return (
    <section className="view editorial-ingestion-view">
      <header className="candidate-header">
        <div>
          <div className="eyebrow">Editorial Ingestion</div>
          <h1>Stage source material safely</h1>
          <p className="dashboard-lede">
            Create manual import sessions, preserve provenance, and route uncertainty into review before any real document ingestion.
          </p>
        </div>
      </header>

      <div className="editorial-ingestion-layout">
        <section className="editorial-ingestion-panel" aria-labelledby="import-session-heading">
          <div className="editorial-ingestion-heading">
            <FilePlus2 size={17} />
            <div>
              <h2 id="import-session-heading">Import Session</h2>
              <span>Source memory first. Canon stays unchanged.</span>
            </div>
          </div>
          <form className="editorial-ingestion-form" onSubmit={saveSession}>
            <label>
              <span>Session title</span>
              <input onChange={(event) => updateSessionDraft('title', event.target.value)} placeholder="Manual extraction test" value={sessionDraft.title} />
            </label>
            <label>
              <span>Source type</span>
              <select onChange={(event) => updateSessionDraft('sourceType', event.target.value)} value={sessionDraft.sourceType}>
                <option value="manual">Manual note</option>
                <option value="document">Document excerpt</option>
                <option value="zip-test">ZIP test</option>
                <option value="archive">Source archive</option>
              </select>
            </label>
            <label>
              <span>Provenance note</span>
              <input onChange={(event) => updateSessionDraft('provenanceNote', event.target.value)} placeholder="Where this test source came from" value={sessionDraft.provenanceNote} />
            </label>
            <label>
              <span>Session notes</span>
              <textarea onChange={(event) => updateSessionDraft('notes', event.target.value)} placeholder="Optional editorial context" value={sessionDraft.notes} />
            </label>
            <button className="primary-button" disabled={saving || !sessionDraft.title.trim() || !sessionDraft.provenanceNote.trim()} type="submit">
              <Plus size={14} />
              <span>Create Session</span>
            </button>
          </form>
        </section>

        <section className="editorial-ingestion-panel" aria-labelledby="extraction-candidate-heading">
          <div className="editorial-ingestion-heading">
            <Layers3 size={17} />
            <div>
              <h2 id="extraction-candidate-heading">Extraction Candidate</h2>
              <span>Manual staging only. Review routes stay explicit.</span>
            </div>
          </div>
          <form className="editorial-ingestion-form" onSubmit={saveCandidate}>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Session</span>
                <select onChange={(event) => updateCandidateDraft('importSessionId', event.target.value)} value={candidateDraft.importSessionId}>
                  <option value="">Choose a session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>{session.title}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Confidence</span>
                <select onChange={(event) => updateCandidateDraft('confidenceState', event.target.value)} value={candidateDraft.confidenceState}>
                  <option value="weak">Weak</option>
                  <option value="inferred">Inferred</option>
                  <option value="speculative">Speculative</option>
                  <option value="strong">Strong</option>
                  <option value="explicit">Explicit</option>
                </select>
              </label>
            </div>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Source label</span>
                <input onChange={(event) => updateCandidateDraft('sourceLabel', event.target.value)} placeholder="Interview note, old outline, AI export..." value={candidateDraft.sourceLabel} />
              </label>
              <label>
                <span>Classification</span>
                <select onChange={(event) => updateCandidateDraft('classification', event.target.value)} value={candidateDraft.classification}>
                  <option value="candidate">Candidate</option>
                  <option value="unresolved-question">Unresolved question</option>
                  <option value="possible-duplicate">Possible duplicate</option>
                  <option value="continuity-risk">Continuity risk</option>
                  <option value="contradiction">Contradiction</option>
                  <option value="narrative-fragment">Narrative fragment</option>
                  <option value="pending-placement">Pending placement</option>
                </select>
              </label>
            </div>
            <label>
              <span>Raw source excerpt</span>
              <textarea onChange={(event) => updateCandidateDraft('rawContent', event.target.value)} placeholder="Paste the preserved source text here" value={candidateDraft.rawContent} />
            </label>
            <label>
              <span>Candidate title</span>
              <input onChange={(event) => updateCandidateDraft('title', event.target.value)} placeholder="Short review title" value={candidateDraft.title} />
            </label>
            <label>
              <span>Candidate content</span>
              <textarea onChange={(event) => updateCandidateDraft('content', event.target.value)} placeholder="Manually extracted claim, note, or fragment" value={candidateDraft.content} />
            </label>
            <label>
              <span>Trust note</span>
              <input onChange={(event) => updateCandidateDraft('trustReason', event.target.value)} placeholder="Why confidence is weak, strong, inferred, or speculative" value={candidateDraft.trustReason} />
            </label>
            <div className="editorial-routing-options">
              <label>
                <input checked={candidateDraft.flagDuplicate} onChange={(event) => updateCandidateDraft('flagDuplicate', event.target.checked)} type="checkbox" />
                <span><GitCompareArrows size={14} /> Route duplicate uncertainty</span>
              </label>
              {candidateDraft.flagDuplicate ? (
                <input onChange={(event) => updateCandidateDraft('duplicateReason', event.target.value)} placeholder="Duplicate review note" value={candidateDraft.duplicateReason} />
              ) : null}
              <label>
                <input checked={candidateDraft.flagContradiction} onChange={(event) => updateCandidateDraft('flagContradiction', event.target.checked)} type="checkbox" />
                <span><Flag size={14} /> Route contradiction</span>
              </label>
              {candidateDraft.flagContradiction ? (
                <input onChange={(event) => updateCandidateDraft('contradictionClaim', event.target.value)} placeholder="Existing claim to compare against" value={candidateDraft.contradictionClaim} />
              ) : null}
            </div>
            <button className="primary-button" disabled={saving} type="submit">
              <ShieldCheck size={14} />
              <span>Stage for Review</span>
            </button>
          </form>
          {message ? <p className="candidate-message" role="status">{message}</p> : null}
        </section>

        <aside className="editorial-ingestion-panel editorial-ingestion-review" aria-labelledby="staged-review-heading">
          <div className="editorial-ingestion-heading">
            <ShieldCheck size={17} />
            <div>
              <h2 id="staged-review-heading">Review Surface</h2>
              <span>Everything here is recoverable and non-canon.</span>
            </div>
          </div>
          <div className="editorial-ingestion-safety">
            <span>Provenance required</span>
            <span>No automatic merge</span>
            <span>No canon mutation</span>
          </div>
          <div className="editorial-ingestion-list">
            {stagedItems.map((item) => (
              <div className="editorial-ingestion-item" key={item.key}>
                <strong>{item.title}</strong>
                <small>{item.meta} / {formatDate(item.timestamp)}</small>
                <StatusBadge status={item.status} />
              </div>
            ))}
            {!stagedItems.length ? <p className="muted">No staged review items yet.</p> : null}
          </div>
        </aside>
      </div>
    </section>
  );
}

function formatDate(value) {
  return formatCentralTime(value, {
    fallback: 'No timestamp',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  });
}

function formatReviewType(value) {
  return String(value || 'review')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
