import { ArrowLeft, FilePlus2, FileText, Flag, GitCompareArrows, Layers3, Paperclip, Plus, ShieldCheck, X } from 'lucide-react';
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

const initialSourceDraft = {
  importSessionId: '',
  sourceLabel: '',
  sourceType: 'imported-document',
  sourceTypeLabel: '',
  provenanceNote: '',
  rawContent: '',
  originalFilename: '',
  fileExtension: '',
  fileSize: 0,
  previewState: 'pending',
  previewNote: '',
  checksum: ''
};

const SOURCE_PREVIEW_LIMIT = 6000;

export default function EditorialIngestion() {
  const [sessionDraft, setSessionDraft] = useState(initialSessionDraft);
  const [sourceDraft, setSourceDraft] = useState(initialSourceDraft);
  const [candidateDraft, setCandidateDraft] = useState(initialCandidateDraft);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedReviewKey, setSelectedReviewKey] = useState(null);
  const sessionTitleRef = useRef(null);
  const sessionSelectRef = useRef(null);
  const ingestionReviewSummary = useRevivalStore((state) => state.ingestionReviewSummary);
  const createImportSession = useRevivalStore((state) => state.createImportSession);
  const createStagedSource = useRevivalStore((state) => state.createStagedSource);
  const createManualExtractionCandidate = useRevivalStore((state) => state.createManualExtractionCandidate);
  const sessions = ingestionReviewSummary.sessions || [];
  const sourceRecords = ingestionReviewSummary.sourceRecords || [];
  const selectedSessionSources = sourceRecords.filter((source) => String(source.import_session_id || '') === String(sourceDraft.importSessionId || candidateDraft.importSessionId || ''));
  const stagedItems = useMemo(() => [
    ...(ingestionReviewSummary.sourceRecords || []).map((item) => ({
      key: `source-${item.id}`,
      kind: 'Staged Source',
      title: item.source_label,
      meta: `${formatSourceType(item.source_type, item.provenance_metadata?.custom_source_label)} / ${item.session_title || 'Session linked'}`,
      status: item.provenance_metadata?.file_preview_state || 'staged',
      timestamp: item.created_at,
      sourceLabel: item.source_label,
      sourceType: item.source_type,
      sourceTypeLabel: item.provenance_metadata?.custom_source_label,
      excerpt: item.raw_content,
      content: item.provenance_metadata?.file_preview_note || 'Source is staged and unreviewed.',
      provenance: item.provenance_metadata
    })),
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
  const updateSourceDraft = (field, value) => setSourceDraft((draft) => ({ ...draft, [field]: value }));
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
    setSourceDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSessionDraft(initialSessionDraft);
    setMessage('Import session saved. Staged material remains non-canon.');
  };

  const selectSourceFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = getFileExtension(file.name);
    const detectedType = detectSourceType(extension);
    const readable = isReadablePreview(extension);
    const baseDraft = {
      sourceLabel: sourceDraft.sourceLabel || file.name,
      sourceType: detectedType,
      originalFilename: file.name,
      fileExtension: extension || 'unknown',
      fileSize: file.size || 0,
      checksum: `${file.name}:${file.size}:${file.lastModified || ''}`
    };

    if (!readable) {
      setSourceDraft((draft) => ({
        ...draft,
        ...baseDraft,
        rawContent: buildPlaceholderPreview(file, extension),
        previewState: 'placeholder',
        previewNote: 'Binary or unsupported source preserved as a staged record. Full extraction remains future work.'
      }));
      return;
    }

    try {
      const text = await file.text();
      setSourceDraft((draft) => ({
        ...draft,
        ...baseDraft,
        rawContent: buildTextPreview(text),
        previewState: text.length > SOURCE_PREVIEW_LIMIT ? 'truncated-preview' : 'readable-preview',
        previewNote: text.length > SOURCE_PREVIEW_LIMIT ? `Readable preview truncated at ${SOURCE_PREVIEW_LIMIT} characters.` : 'Readable preview preserved.'
      }));
    } catch (error) {
      setSourceDraft((draft) => ({
        ...draft,
        ...baseDraft,
        rawContent: buildPlaceholderPreview(file, extension),
        previewState: 'preview-failed',
        previewNote: 'Preview failed safely; source metadata remains staged.'
      }));
    }
  };

  const saveSource = async (event) => {
    event.preventDefault();
    if (!sourceDraft.importSessionId || !sourceDraft.sourceLabel.trim() || !sourceDraft.provenanceNote.trim() || !sourceDraft.rawContent.trim()) {
      setMessage('Session, source file, source label, and provenance note are required.');
      return;
    }

    setSaving(true);
    const response = await createStagedSource(sourceDraft);
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Staged source could not be saved.');
      return;
    }

    setSourceDraft((draft) => ({
      ...initialSourceDraft,
      importSessionId: draft.importSessionId,
      sourceType: draft.sourceType,
      sourceTypeLabel: draft.sourceTypeLabel
    }));
    setMessage('Source attached to session. It remains staged and non-canon.');
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

          <section className="editorial-ingestion-panel" aria-labelledby="staged-source-heading">
            <div className="editorial-ingestion-heading">
              <Paperclip size={17} />
              <div>
                <h2 id="staged-source-heading">Staged Source</h2>
                <span>Attach a local source without extraction or promotion.</span>
              </div>
            </div>
            <form className="editorial-ingestion-form" onSubmit={saveSource}>
              <div className="editorial-ingestion-grid">
                <label>
                  <span>Session</span>
                  <select onChange={(event) => updateSourceDraft('importSessionId', event.target.value)} value={sourceDraft.importSessionId}>
                    <option value="">Choose a session</option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>{formatSessionOption(session)}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Source file</span>
                  <input accept=".txt,.md,.pdf,.doc,.docx,text/plain,text/markdown" onChange={selectSourceFile} type="file" />
                </label>
              </div>
              <div className="editorial-ingestion-grid">
                <label>
                  <span>Source label</span>
                  <input onChange={(event) => updateSourceDraft('sourceLabel', event.target.value)} placeholder="Original file or archive label" value={sourceDraft.sourceLabel} />
                </label>
                <label>
                  <span>Source type</span>
                  <select onChange={(event) => updateSourceDraft('sourceType', event.target.value)} value={sourceDraft.sourceType}>
                    {sourceTypePresets.map((preset) => (
                      <option key={preset.value} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>Provenance note</span>
                <input onChange={(event) => updateSourceDraft('provenanceNote', event.target.value)} placeholder="Where this file came from and why it is staged" value={sourceDraft.provenanceNote} />
              </label>
              <div className="source-preview-card">
                <div>
                  <FileText size={15} />
                  <strong>{sourceDraft.originalFilename || 'No source selected'}</strong>
                  {sourceDraft.fileSize ? <small>{formatBytes(sourceDraft.fileSize)} / {formatReviewType(sourceDraft.previewState)}</small> : <small>TXT and MD preview lightly; binaries stay as placeholders.</small>}
                </div>
                <p>{sourceDraft.rawContent || 'Select a local source to stage it inside the current intake session.'}</p>
              </div>
              <button className="primary-button" disabled={saving || !sourceDraft.importSessionId || !sourceDraft.rawContent.trim() || !sourceDraft.provenanceNote.trim()} type="submit">
                <ShieldCheck size={14} />
                <span>Attach Source</span>
              </button>
            </form>

            {selectedSessionSources.length ? (
              <div className="session-source-list" aria-label="Attached sources">
                <div className="editorial-review-queue-heading">
                  <strong>Attached Sources</strong>
                  <small>{selectedSessionSources.length} staged</small>
                </div>
                {selectedSessionSources.slice(0, 4).map((source) => (
                  <article className="session-source-row" key={source.id}>
                    <span className="source-type-badge">{formatSourceType(source.source_type, source.provenance_metadata?.custom_source_label)}</span>
                    <strong>{source.source_label}</strong>
                    <small>{formatDate(source.created_at)} / {source.provenance_metadata?.file_preview_state || 'staged'}</small>
                  </article>
                ))}
              </div>
            ) : null}
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
                    <option key={session.id} value={session.id}>{formatSessionOption(session)}</option>
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
                  <div className="editorial-review-meta-grid source-provenance-grid">
                    <ReviewFact label="Original file" value={selectedReviewItem.provenance?.original_filename || 'Manual source'} />
                    <ReviewFact label="Imported" value={selectedReviewItem.provenance?.imported_at_central || formatDate(selectedReviewItem.provenance?.imported_at)} />
                    <ReviewFact label="Layer" value={formatReviewType(selectedReviewItem.provenance?.memory_layer || 'source')} />
                    <ReviewFact label="Canon" value={selectedReviewItem.provenance?.canon_mutation ? 'Changed' : 'Unchanged'} />
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

function formatSessionOption(session) {
  const count = Number(session?.source_count || 0);
  return count ? `${session.title} (${count} source${count === 1 ? '' : 's'})` : session.title;
}

function getFileExtension(filename) {
  const match = String(filename || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || '';
}

function isReadablePreview(extension) {
  return ['txt', 'md', 'markdown'].includes(String(extension || '').toLowerCase());
}

function detectSourceType(extension) {
  const normalized = String(extension || '').toLowerCase();
  if (normalized === 'md' || normalized === 'markdown') return 'draft-notes';
  if (normalized === 'txt') return 'imported-document';
  if (['pdf', 'doc', 'docx'].includes(normalized)) return 'imported-document';
  return 'unknown';
}

function buildTextPreview(text) {
  const normalized = String(text || '').replace(/\u0000/g, '').trim();
  if (!normalized) return '[Readable source selected, but no text content was detected.]';
  return normalized.length > SOURCE_PREVIEW_LIMIT
    ? `${normalized.slice(0, SOURCE_PREVIEW_LIMIT)}\n\n[Preview truncated. Source remains staged only.]`
    : normalized;
}

function buildPlaceholderPreview(file, extension) {
  return [
    `[Staged source placeholder]`,
    `Original filename: ${file?.name || 'Unknown file'}`,
    `Source type: ${extension || 'unknown'}`,
    `Size: ${formatBytes(file?.size || 0)}`,
    `Preview: unavailable in this safe staging pass.`
  ].join('\n');
}

function formatBytes(bytes) {
  const size = Number(bytes || 0);
  if (!size) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
