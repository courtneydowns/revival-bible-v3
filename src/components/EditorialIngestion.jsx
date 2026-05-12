import { ArrowLeft, FilePlus2, Flag, GitCompareArrows, Layers3, Plus, ShieldCheck, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';
import StatusBadge from './StatusBadge.jsx';

const initialSessionDraft = {
  title: '',
  sourceType: 'draft-notes',
  sourceTypeLabel: '',
  notes: '',
  provenanceNote: ''
};

const initialCandidateDraft = {
  importSessionId: '',
  sourceLabel: '',
  sourceType: 'draft-notes',
  sourceTypeLabel: '',
  provenanceNote: '',
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
  const [selectedReviewKey, setSelectedReviewKey] = useState(null);
  const sessionTitleRef = useRef(null);
  const sessionSelectRef = useRef(null);
  const ingestionReviewSummary = useRevivalStore((state) => state.ingestionReviewSummary);
  const createImportSession = useRevivalStore((state) => state.createImportSession);
  const createManualExtractionCandidate = useRevivalStore((state) => state.createManualExtractionCandidate);
  const sessions = ingestionReviewSummary.sessions || [];
  const stagedItems = useMemo(() => [
    ...(ingestionReviewSummary.unresolvedExtractions || []).map((item) => ({
      key: `extraction-${item.id}`,
      kind: 'Extraction Candidate',
      title: item.title,
      meta: `${formatReviewType(item.classification)} / ${item.source_label || 'Source preserved'}`,
      status: item.confidence_state || item.status,
      timestamp: item.updated_at || item.created_at,
      sourceLabel: item.source_label,
      sourceType: item.source_type,
      sourceTypeLabel: item.provenance_metadata?.custom_source_label,
      excerpt: item.raw_content,
      content: item.content,
      trustReason: item.trust_reason,
      provenance: item.provenance_metadata
    })),
    ...(ingestionReviewSummary.narrativeFragments || []).map((item) => ({
      key: `fragment-${item.id}`,
      kind: 'Narrative Fragment',
      title: item.title,
      meta: `${formatReviewType(item.fragment_type)} / Non-canon fragment`,
      status: item.confidence_state || item.status,
      timestamp: item.updated_at || item.created_at,
      sourceLabel: item.source_label,
      sourceType: item.source_type,
      sourceTypeLabel: item.provenance_metadata?.custom_source_label,
      excerpt: item.raw_content,
      content: item.content,
      provenance: item.provenance_metadata
    })),
    ...(ingestionReviewSummary.duplicateReviews || []).map((item) => ({
      key: `duplicate-${item.id}`,
      kind: 'Duplicate Review',
      title: 'Possible duplicate',
      meta: item.reason || 'Manual duplicate review',
      status: item.confidence || item.status,
      timestamp: item.updated_at || item.created_at,
      content: `Compare ${formatReviewEndpoint(item.left_type, item.left_id)} with ${formatReviewEndpoint(item.right_type, item.right_id)}.`,
      trustReason: item.reason,
      provenance: item.provenance_metadata
    })),
    ...(ingestionReviewSummary.continuityReviews || []).map((item) => ({
      key: `continuity-${item.id}`,
      kind: 'Continuity Review',
      title: item.title,
      meta: 'Continuity review',
      status: item.confidence_state || item.risk_level,
      timestamp: item.updated_at || item.created_at,
      content: item.claim_b,
      conflict: item.claim_a,
      provenance: item.provenance_metadata
    }))
  ].sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()).slice(0, 10), [ingestionReviewSummary]);
  const selectedReviewItem = stagedItems.find((item) => item.key === selectedReviewKey) || null;

  useEffect(() => {
    if (selectedReviewKey && !stagedItems.some((item) => item.key === selectedReviewKey)) {
      setSelectedReviewKey(stagedItems[0]?.key || null);
    }
  }, [selectedReviewKey, stagedItems]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedReviewKey(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  const updateSessionDraft = (field, value) => setSessionDraft((draft) => ({ ...draft, [field]: value }));
  const updateCandidateDraft = (field, value) => setCandidateDraft((draft) => ({ ...draft, [field]: value }));

  const openNewSessionDraft = () => {
    setSessionDraft(initialSessionDraft);
    setMessage('New editorial staging session ready. Add provenance before saving.');
    setTimeout(() => sessionTitleRef.current?.focus(), 0);
  };

  const reviewSessions = () => {
    setTimeout(() => sessionSelectRef.current?.focus(), 0);
  };

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
        custom_source_label: sessionDraft.sourceTypeLabel,
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
    if (!candidateDraft.importSessionId || !candidateDraft.sourceLabel.trim() || !candidateDraft.provenanceNote.trim() || !candidateDraft.rawContent.trim() || !candidateDraft.title.trim() || !candidateDraft.content.trim() || !candidateDraft.trustReason.trim()) {
      setMessage('Session, source label, provenance note, source text, candidate title, candidate content, and trust note are required.');
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
      sourceType: draft.sourceType,
      sourceTypeLabel: draft.sourceTypeLabel
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
        <div className="editorial-ingestion-header-actions" aria-label="Editorial ingestion session actions">
          <button className="secondary-button editorial-ingestion-header-button" onClick={openNewSessionDraft} type="button">
            <Plus size={14} />
            <span>New Session</span>
          </button>
          {sessions.length ? (
            <button className="secondary-button editorial-ingestion-header-button quiet" onClick={reviewSessions} type="button">
              <span>Review Sessions</span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="editorial-ingestion-layout">
        <div className="editorial-ingestion-intake">
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
                <input ref={sessionTitleRef} onChange={(event) => updateSessionDraft('title', event.target.value)} placeholder="Manual extraction test" value={sessionDraft.title} />
              </label>
              <div className="editorial-ingestion-grid">
                <label>
                  <span>Source preset</span>
                  <select onChange={(event) => updateSessionDraft('sourceType', event.target.value)} value={sessionDraft.sourceType}>
                    {sourceTypePresets.map((preset) => (
                      <option key={preset.value} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Custom label</span>
                  <input onChange={(event) => updateSessionDraft('sourceTypeLabel', event.target.value)} placeholder="Optional shelf label" value={sessionDraft.sourceTypeLabel} />
                </label>
              </div>
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
                <select ref={sessionSelectRef} onChange={(event) => updateCandidateDraft('importSessionId', event.target.value)} value={candidateDraft.importSessionId}>
                  <option value="">Choose a session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>{session.title}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Confidence</span>
                <select
                  onChange={(event) => updateCandidateDraft('confidenceState', event.target.value)}
                  title={getConfidenceDefinition(candidateDraft.confidenceState)}
                  value={candidateDraft.confidenceState}
                >
                  {confidencePresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Source label</span>
                <input onChange={(event) => updateCandidateDraft('sourceLabel', event.target.value)} placeholder="Interview note, old outline, AI export..." value={candidateDraft.sourceLabel} />
              </label>
              <label>
                <span>Source preset</span>
                <select onChange={(event) => updateCandidateDraft('sourceType', event.target.value)} value={candidateDraft.sourceType}>
                  {sourceTypePresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Custom label</span>
                <input onChange={(event) => updateCandidateDraft('sourceTypeLabel', event.target.value)} placeholder="Optional archive label" value={candidateDraft.sourceTypeLabel} />
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
              <span>Source provenance note</span>
              <input onChange={(event) => updateCandidateDraft('provenanceNote', event.target.value)} placeholder="Where this excerpt came from and why it is being staged" value={candidateDraft.provenanceNote} />
            </label>
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
              <input onChange={(event) => updateCandidateDraft('trustReason', event.target.value)} placeholder={getConfidenceDefinition(candidateDraft.confidenceState)} value={candidateDraft.trustReason} />
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
        </div>

        <section className="editorial-ingestion-panel editorial-review-workspace" aria-labelledby="staged-review-heading">
          <div className="editorial-ingestion-heading">
            <ShieldCheck size={17} />
            <div>
              <h2 id="staged-review-heading">Review Workspace</h2>
              <span>Inspectable, recoverable, and non-canon.</span>
            </div>
          </div>
          <div className="editorial-ingestion-safety">
            <span>Provenance required</span>
            <span>No automatic merge</span>
            <span>No canon mutation</span>
          </div>

          <div className="editorial-review-split">
            <nav className="editorial-review-queue" aria-label="Review queue">
              <div className="editorial-review-queue-heading">
                <strong>Queue</strong>
                <small>{stagedItems.length} waiting</small>
              </div>
              <div className="editorial-ingestion-list">
                {stagedItems.map((item) => (
                  <button
                    aria-current={selectedReviewKey === item.key ? 'true' : undefined}
                    className={`editorial-ingestion-item ${selectedReviewKey === item.key ? 'selected' : ''}`}
                    key={item.key}
                    onClick={() => setSelectedReviewKey(item.key)}
                    type="button"
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.kind} / {formatDate(item.timestamp)}</small>
                    </span>
                    <StatusBadge status={item.status} />
                  </button>
                ))}
                {!stagedItems.length ? <p className="muted">No staged review items yet.</p> : null}
              </div>
            </nav>

            <article className="editorial-review-detail" aria-live="polite">
              {selectedReviewItem ? (
                <>
                  <div className="editorial-review-detail-actions">
                    <button className="secondary-button editorial-ingestion-header-button quiet" onClick={() => setSelectedReviewKey(null)} type="button">
                      <ArrowLeft size={14} />
                      <span>Back to Queue</span>
                    </button>
                    <button aria-label="Close review detail" className="icon-button" onClick={() => setSelectedReviewKey(null)} title="Close review detail" type="button">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="editorial-review-detail-header">
                    <div>
                      <small>{selectedReviewItem.kind}</small>
                      <h3>{selectedReviewItem.title}</h3>
                    </div>
                    <StatusBadge status={selectedReviewItem.status} />
                  </div>
                  <div className="editorial-review-meta-grid">
                    <ReviewFact label="Source" value={selectedReviewItem.sourceLabel || selectedReviewItem.provenance?.source_label || 'Source preserved'} />
                    <ReviewFact label="Type" value={formatSourceType(selectedReviewItem.sourceType, selectedReviewItem.sourceTypeLabel || selectedReviewItem.provenance?.custom_source_label)} />
                    <ReviewFact label="Confidence" value={formatConfidence(selectedReviewItem.status)} />
                    <ReviewFact label="Updated" value={formatDate(selectedReviewItem.timestamp)} />
                  </div>
                  {selectedReviewItem.conflict ? (
                    <ReviewBlock label="Continuity context" value={selectedReviewItem.conflict} />
                  ) : null}
                  <ReviewBlock label="Review material" value={selectedReviewItem.content || selectedReviewItem.meta} />
                  <ReviewBlock label="Raw source excerpt" value={selectedReviewItem.excerpt || selectedReviewItem.provenance?.source_note || 'No raw excerpt is attached to this review item.'} />
                  <ReviewBlock label="Editorial note" value={selectedReviewItem.trustReason || selectedReviewItem.provenance?.source_note || 'No editorial note recorded.'} />
                </>
              ) : (
                <div className="editorial-review-empty">
                  <ShieldCheck size={20} />
                  <strong>Select a review item</strong>
                  <span>Use the queue to inspect provenance, excerpts, contradictions, duplicates, and editorial notes.</span>
                </div>
              )}
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}

const sourceTypePresets = [
  { value: 'draft-notes', label: 'Draft Notes' },
  { value: 'outline', label: 'Outline' },
  { value: 'character-notes', label: 'Character Notes' },
  { value: 'episode-notes', label: 'Episode Notes' },
  { value: 'timeline-notes', label: 'Timeline Notes' },
  { value: 'voice-memo', label: 'Voice Memo' },
  { value: 'ai-session', label: 'AI Session' },
  { value: 'previous-bible', label: 'Previous Bible' },
  { value: 'imported-document', label: 'Imported Document' },
  { value: 'research-interview', label: 'Research / Interview' },
  { value: 'fragment', label: 'Fragment' },
  { value: 'unknown', label: 'Unknown' }
];

const confidencePresets = [
  { value: 'confirmed', label: 'Confirmed', definition: 'Directly supported by source material or prior canon.' },
  { value: 'strong', label: 'Strong', definition: 'Well supported, but still waiting for final editorial placement.' },
  { value: 'moderate', label: 'Moderate', definition: 'Plausible and useful, with context still worth checking.' },
  { value: 'weak', label: 'Weak', definition: 'Thinly supported or needs a continuity pass before use.' },
  { value: 'speculative', label: 'Speculative', definition: 'Idea-level material preserved without canon authority.' }
];

function ReviewFact({ label, value }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ReviewBlock({ label, value }) {
  return (
    <section className="editorial-review-block">
      <span>{label}</span>
      <p>{value}</p>
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

function formatSourceType(value, customLabel) {
  const preset = sourceTypePresets.find((item) => item.value === value);
  const label = preset?.label || formatReviewType(value || 'unknown');
  return customLabel ? `${label} / ${customLabel}` : label;
}

function formatConfidence(value) {
  const normalized = String(value || '').toLowerCase();
  if (normalized === 'explicit') return 'Confirmed';
  if (normalized === 'inferred') return 'Moderate';
  return formatReviewType(value);
}

function getConfidenceDefinition(value) {
  return confidencePresets.find((preset) => preset.value === value)?.definition || 'Editorial confidence remains manually assigned.';
}

function formatReviewEndpoint(type, id) {
  return `${formatReviewType(type)} #${id || 'unknown'}`;
}
