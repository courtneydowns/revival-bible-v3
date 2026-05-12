import { ArrowLeft, CheckSquare, FilePlus2, FileText, Flag, GitCompareArrows, Layers3, Paperclip, Plus, ShieldCheck, Square, X } from 'lucide-react';
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
  sourceRecordId: '',
  sourceLabel: '',
  sourceType: 'draft-notes',
  sourceTypeLabel: '',
  provenanceNote: '',
  rawContent: '',
  title: '',
  content: '',
  classification: 'candidate',
  confidenceState: 'weak',
  reviewStatus: 'unreviewed',
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
  const [sourceAttachmentMessage, setSourceAttachmentMessage] = useState('');
  const [sessionValidationMessage, setSessionValidationMessage] = useState('');
  const [sourceValidationMessage, setSourceValidationMessage] = useState('');
  const [candidateValidationMessage, setCandidateValidationMessage] = useState('');
  const [lastAttachedSourceId, setLastAttachedSourceId] = useState(null);
  const [lastStagedReview, setLastStagedReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectingSourceFile, setSelectingSourceFile] = useState(false);
  const [selectedReviewKey, setSelectedReviewKey] = useState(null);
  const [reviewStateFilter, setReviewStateFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [selectedExtractionIds, setSelectedExtractionIds] = useState([]);
  const [batchNote, setBatchNote] = useState('');
  const [expandedSourceIds, setExpandedSourceIds] = useState(['unassigned']);
  const sessionTitleRef = useRef(null);
  const sessionSelectRef = useRef(null);
  const sourceFileInputRef = useRef(null);
  const ingestionReviewSummary = useRevivalStore((state) => state.ingestionReviewSummary);
  const createImportSession = useRevivalStore((state) => state.createImportSession);
  const createStagedSource = useRevivalStore((state) => state.createStagedSource);
  const createManualExtractionCandidate = useRevivalStore((state) => state.createManualExtractionCandidate);
  const updateExtractionReviewTriage = useRevivalStore((state) => state.updateExtractionReviewTriage);
  const sessions = ingestionReviewSummary.sessions || [];
  const sourceRecords = ingestionReviewSummary.sourceRecords || [];
  const selectedSourceDraftSources = sourceRecords.filter((source) => String(source.import_session_id || '') === String(sourceDraft.importSessionId || ''));
  const selectedCandidateSessionSources = sourceRecords.filter((source) => (
    String(source.import_session_id || '') === String(candidateDraft.importSessionId || '')
    && source.provenance_metadata?.memory_layer !== 'editorial'
  ));
  const stagedItems = useMemo(() => [
    ...(ingestionReviewSummary.sourceRecords || []).map((item) => ({
      key: `source-${item.id}`,
      id: item.id,
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
      id: item.id,
      sourceRecordId: item.source_record_id,
      kind: 'Extraction Candidate',
      title: item.title,
      meta: `${formatReviewType(item.classification)} / ${item.source_label || 'Source preserved'}`,
      status: normalizeExtractionTriageState(item.status),
      confidence: item.confidence_state,
      classification: item.classification,
      timestamp: item.updated_at || item.created_at,
      sourceLabel: item.source_label,
      sourceType: item.source_type,
      sourceTypeLabel: item.provenance_metadata?.custom_source_label,
      excerpt: item.raw_content,
      content: item.content,
      trustReason: item.trust_reason,
      triageNote: item.provenance_metadata?.triage_note,
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
  ].sort(compareReviewPriority), [ingestionReviewSummary]);
  const extractionItems = useMemo(() => stagedItems.filter((item) => item.kind === 'Extraction Candidate'), [stagedItems]);
  const sourceClusters = useMemo(() => {
    const sourceLookup = new Map((ingestionReviewSummary.sourceRecords || []).map((source) => [String(source.id), source]));
    const grouped = new Map();
    for (const item of extractionItems) {
      const source = sourceLookup.get(String(item.sourceRecordId));
      const key = String(item.sourceRecordId || 'unassigned');
      if (!grouped.has(key)) {
        grouped.set(key, {
          key,
          source,
          title: source?.source_label || item.sourceLabel || 'Unassigned source',
          meta: source ? formatSourceType(source.source_type, source.provenance_metadata?.custom_source_label) : 'Source metadata pending',
          items: []
        });
      }
      grouped.get(key).items.push(item);
    }
    return [...grouped.values()]
      .map((cluster) => ({
        ...cluster,
        items: cluster.items.filter((item) => matchesReviewFilters(item, reviewStateFilter, riskFilter))
      }))
      .filter((cluster) => cluster.items.length)
      .sort((a, b) => compareReviewPriority(a.items[0], b.items[0]));
  }, [extractionItems, ingestionReviewSummary.sourceRecords, reviewStateFilter, riskFilter]);
  const visibleReviewItems = useMemo(() => sourceClusters.flatMap((cluster) => cluster.items), [sourceClusters]);
  const visibleTriageCounts = useMemo(() => visibleReviewItems.reduce((counts, item) => {
    counts[item.status] = (counts[item.status] || 0) + 1;
    return counts;
  }, {}), [visibleReviewItems]);
  const selectedReviewItem = stagedItems.find((item) => item.key === selectedReviewKey) || null;
  const selectedExtractionSet = useMemo(() => new Set(selectedExtractionIds.map(String)), [selectedExtractionIds]);
  const selectedExtractionCount = selectedExtractionIds.length;
  const lastAttachedSource = sourceRecords.find((source) => String(source.id) === String(lastAttachedSourceId)) || null;
  const acceptedCount = visibleTriageCounts['accepted-for-placement'] || 0;
  const unresolvedCount = visibleReviewItems.filter((item) => !['resolved', 'deferred'].includes(item.status)).length;
  const contradictionCount = visibleTriageCounts['contradiction-risk'] || 0;
  const duplicateCount = visibleTriageCounts['duplicate-risk'] || 0;

  useEffect(() => {
    if (selectedReviewKey && !stagedItems.some((item) => item.key === selectedReviewKey)) {
      setSelectedReviewKey(stagedItems[0]?.key || null);
    }
  }, [selectedReviewKey, stagedItems]);

  useEffect(() => {
    setExpandedSourceIds((ids) => {
      const visibleKeys = sourceClusters.map((cluster) => cluster.key);
      return [...new Set([...ids, ...visibleKeys])];
    });
  }, [sourceClusters]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSelectedReviewKey(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  useEffect(() => {
    const sourceInput = sourceFileInputRef.current;
    if (!sourceInput) return undefined;
    const cancelSelection = () => {
      setSelectingSourceFile(false);
      setSourceAttachmentMessage('Source selection cancelled.');
    };
    sourceInput.addEventListener('cancel', cancelSelection);
    return () => sourceInput.removeEventListener('cancel', cancelSelection);
  }, []);

  const updateSessionDraft = (field, value) => setSessionDraft((draft) => ({ ...draft, [field]: value }));
  const updateSourceDraft = (field, value) => setSourceDraft((draft) => ({ ...draft, [field]: value }));
  const updateCandidateDraft = (field, value) => setCandidateDraft((draft) => ({ ...draft, [field]: value }));
  const selectCandidateSource = (sourceRecordId) => {
    const source = sourceRecords.find((item) => String(item.id) === String(sourceRecordId));
    setCandidateDraft((draft) => ({
      ...draft,
      sourceRecordId,
      importSessionId: source?.import_session_id ? String(source.import_session_id) : draft.importSessionId,
      sourceLabel: source?.source_label || '',
      sourceType: source?.source_type || 'draft-notes',
      sourceTypeLabel: source?.provenance_metadata?.custom_source_label || '',
      provenanceNote: source?.provenance_metadata?.source_note || '',
      rawContent: source?.raw_content || ''
    }));
  };
  const toggleCluster = (clusterKey) => {
    setExpandedSourceIds((ids) => ids.includes(clusterKey)
      ? ids.filter((id) => id !== clusterKey)
      : [...ids, clusterKey]);
  };
  const toggleExtractionSelection = (itemId) => {
    setSelectedExtractionIds((ids) => ids.some((id) => String(id) === String(itemId))
      ? ids.filter((id) => String(id) !== String(itemId))
      : [...ids, itemId]);
  };
  const toggleClusterSelection = (items) => {
    const ids = items.map((item) => item.id);
    const allSelected = ids.every((id) => selectedExtractionSet.has(String(id)));
    setSelectedExtractionIds((selectedIds) => allSelected
      ? selectedIds.filter((id) => !ids.some((itemId) => String(itemId) === String(id)))
      : [...new Set([...selectedIds, ...ids])]);
  };
  const applyBatchTriage = async (status) => {
    if (!selectedExtractionIds.length) return;
    setSaving(true);
    const response = await updateExtractionReviewTriage({ ids: selectedExtractionIds, status, note: batchNote });
    setSaving(false);
    if (!response?.ok) {
      setMessage(response?.message || 'Review triage could not be saved.');
      return;
    }
    setSelectedExtractionIds([]);
    setBatchNote('');
    setMessage(`${formatReviewType(status)} saved for selected review items.`);
  };

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
    const missing = getMissingSessionFields(sessionDraft);
    if (missing.length) {
      setSessionValidationMessage(`Before creating a session, add ${formatMissingFields(missing)}.`);
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

    setSessionValidationMessage('');
    setCandidateDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSourceDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSessionDraft(initialSessionDraft);
    setMessage('Import session saved. Staged material remains non-canon.');
  };

  const getSourceProvenanceNote = (draft = sourceDraft) => {
    const session = sessions.find((item) => String(item.id) === String(draft.importSessionId || ''));
    return String(
      draft.provenanceNote
      || session?.provenance_metadata?.source_note
      || session?.provenance_metadata?.source_label
      || session?.notes
      || ''
    ).trim();
  };

  const ensureSourceDraftSession = async (draftToSave, file) => {
    if (draftToSave.importSessionId) return { ok: true, draft: draftToSave };

    const provenanceNote = draftToSave.provenanceNote || buildAutoProvenanceNote(file?.name);
    const title = buildAutoSessionTitle(file?.name);
    setSaving(true);
    const response = await createImportSession({
      title,
      sourceType: draftToSave.sourceType,
      notes: 'Auto-created when a source file was staged.',
      provenanceMetadata: {
        workflow: 'Editorial Ingestion',
        source_note: provenanceNote,
        source_label: draftToSave.sourceLabel || file?.name || title,
        custom_source_label: draftToSave.sourceTypeLabel,
        original_filename: file?.name || draftToSave.originalFilename,
        preserved: true,
        memory_layer: 'source'
      }
    });
    setSaving(false);

    if (!response?.ok || !response.session) {
      setMessage(response?.message || 'Import session could not be created for this source.');
      setSourceAttachmentMessage(response?.message || 'Source selected, but not saved yet.');
      return { ok: false };
    }

    const sessionBackedDraft = {
      ...draftToSave,
      importSessionId: String(response.session.id),
      provenanceNote
    };
    setSessionValidationMessage('');
    setCandidateDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSourceDraft(sessionBackedDraft);
    return { ok: true, draft: sessionBackedDraft };
  };

  const persistSourceDraft = async (draftToSave, { automatic = false } = {}) => {
    const provenanceNote = getSourceProvenanceNote(draftToSave);
    if (!draftToSave.importSessionId || !draftToSave.sourceLabel.trim() || !provenanceNote || !draftToSave.rawContent.trim()) {
      const missing = getMissingSourceFields(draftToSave, provenanceNote);
      setSourceValidationMessage(`Before this source can be saved, add ${formatMissingFields(missing)}.`);
      if (automatic) {
        setSourceAttachmentMessage('Source selected, but not saved yet.');
        return { ok: false };
      }
      setMessage('Session, source file, source label, and provenance note are required.');
      return { ok: false };
    }

    setSaving(true);
    const response = await createStagedSource({
      ...draftToSave,
      provenanceNote
    });
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Staged source could not be saved.');
      setSourceAttachmentMessage(response?.message || 'Source could not be attached.');
      return response;
    }

    setSourceValidationMessage('');
    setSourceDraft((draft) => ({
      ...draftToSave,
      importSessionId: draftToSave.importSessionId || draft.importSessionId,
      sourceType: draftToSave.sourceType || draft.sourceType,
      sourceTypeLabel: draftToSave.sourceTypeLabel || draft.sourceTypeLabel
    }));
    setLastAttachedSourceId(response.source.id);
    setSourceAttachmentMessage('Source staged safely. Canon remains unchanged.');
    setMessage('Source attached to session. It remains staged and non-canon.');
    return response;
  };

  const stageSelectedSourceDraft = async (nextDraft, file) => {
    setSourceDraft(nextDraft);
    setSelectingSourceFile(false);
    setSourceAttachmentMessage('Source ready to attach.');
    const sessionResult = await ensureSourceDraftSession(nextDraft, file);
    if (!sessionResult.ok) return;
    await persistSourceDraft(sessionResult.draft, { automatic: true });
  };

  const applySelectedSourceFile = async (file) => {
    if (!file) {
      setSelectingSourceFile(false);
      setSourceAttachmentMessage('Source file could not be read.');
      return;
    }

    const extension = file.extension || getFileExtension(file.name);
    const detectedType = detectSourceType(extension);
    const readable = isReadablePreview(extension);
    const baseDraft = {
      ...sourceDraft,
      sourceLabel: sourceDraft.sourceLabel || file.name,
      sourceType: detectedType,
      provenanceNote: sourceDraft.provenanceNote || buildAutoProvenanceNote(file.name),
      originalFilename: file.name,
      fileExtension: extension || 'unknown',
      fileSize: file.size || 0,
      checksum: `${file.name}:${file.size}:${file.lastModified || ''}`
    };
    setSourceValidationMessage('');

    if (!readable) {
      const nextDraft = {
        ...baseDraft,
        rawContent: buildPlaceholderPreview(file, extension),
        previewState: 'placeholder',
        previewNote: 'Binary or unsupported source preserved as a staged record. Full extraction remains future work.'
      };
      await stageSelectedSourceDraft(nextDraft, file);
      return;
    }

    try {
      const text = typeof file.text === 'function' ? await file.text() : file.text || '';
      const nextDraft = {
        ...baseDraft,
        rawContent: buildTextPreview(text),
        previewState: text.length > SOURCE_PREVIEW_LIMIT ? 'truncated-preview' : 'readable-preview',
        previewNote: text.length > SOURCE_PREVIEW_LIMIT ? `Readable preview truncated at ${SOURCE_PREVIEW_LIMIT} characters.` : 'Readable preview preserved.'
      };
      await stageSelectedSourceDraft(nextDraft, file);
    } catch (error) {
      const nextDraft = {
        ...baseDraft,
        rawContent: buildPlaceholderPreview(file, extension),
        previewState: 'preview-failed',
        previewNote: 'Preview failed safely; source metadata remains staged.'
      };
      await stageSelectedSourceDraft(nextDraft, file);
    }
  };

  const markNativeSourcePickerOpening = () => {
    setSelectingSourceFile(true);
    setSourceAttachmentMessage('Opening file picker...');
  };

  const openSourceFilePicker = async () => {
    if (selectingSourceFile) return;
    setSelectingSourceFile(true);
    setSourceAttachmentMessage('Opening file picker...');

    const selectFile = window.revival?.ingestion?.selectSourceFile;
    if (selectFile) {
      try {
        const response = await selectFile();
        if (response?.canceled) {
          setSelectingSourceFile(false);
          setSourceAttachmentMessage('No file selected.');
          return;
        }
        if (!response?.ok || !response.file) {
          setSelectingSourceFile(false);
          setSourceAttachmentMessage(response?.message || 'File picker unavailable.');
          return;
        }
        await applySelectedSourceFile(response.file);
      } catch (error) {
        setSelectingSourceFile(false);
        setSourceAttachmentMessage('File picker unavailable.');
      }
      return;
    }

    if (sourceFileInputRef.current) {
      sourceFileInputRef.current.value = '';
      sourceFileInputRef.current.click();
      return;
    }

    setSelectingSourceFile(false);
    setSourceAttachmentMessage('File picker unavailable.');
  };

  const selectBrowserSourceFile = async (event) => {
    const file = event.target.files?.[0];
    await applySelectedSourceFile(file);
    event.target.value = '';
  };

  const saveSource = async (event) => {
    event.preventDefault();
    await persistSourceDraft(sourceDraft);
  };

  const saveCandidate = async (event) => {
    event.preventDefault();
    const missing = getMissingCandidateFields(candidateDraft);
    if (missing.length) {
      setCandidateValidationMessage(`Before staging for review, add ${formatMissingFields(missing)}.`);
      setMessage('Session, staged source, provenance note, source text, candidate title, candidate content, and trust note are required.');
      return;
    }

    setSaving(true);
    const response = await createManualExtractionCandidate(candidateDraft);
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Staged material could not be saved.');
      return;
    }

    const reviewKey = response.review?.id ? `extraction-${response.review.id}` : null;
    const sourceKey = String(candidateDraft.sourceRecordId || 'unassigned');
    setCandidateValidationMessage('');
    setLastStagedReview({
      key: reviewKey,
      title: response.review?.title || candidateDraft.title,
      sourceLabel: candidateDraft.sourceLabel || 'selected source',
      location: reviewKey ? 'Review Workspace / Review List' : 'Review Workspace',
      status: formatReviewType(response.review?.status || candidateDraft.reviewStatus)
    });
    setReviewStateFilter('all');
    setRiskFilter('all');
    setExpandedSourceIds((ids) => [...new Set([...ids, sourceKey])]);
    if (reviewKey) setSelectedReviewKey(reviewKey);
    setCandidateDraft((draft) => ({
      ...initialCandidateDraft,
      importSessionId: draft.importSessionId,
      sourceType: draft.sourceType,
      sourceTypeLabel: draft.sourceTypeLabel
    }));
    setMessage('Review item staged. It now appears in the Review Workspace list for editorial review. Canon counts are untouched.');
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
                <RequiredLabel>Session title</RequiredLabel>
                <input ref={sessionTitleRef} onChange={(event) => updateSessionDraft('title', event.target.value)} placeholder="Manual extraction test" value={sessionDraft.title} />
                {sessionValidationMessage && !sessionDraft.title.trim() ? <small className="field-validation">Session title is required.</small> : null}
              </label>
              <div className="editorial-ingestion-grid">
                <label>
                  <RequiredLabel>Source preset</RequiredLabel>
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
                <RequiredLabel>Provenance note</RequiredLabel>
                <input onChange={(event) => updateSessionDraft('provenanceNote', event.target.value)} placeholder="Where this test source came from" value={sessionDraft.provenanceNote} />
                {sessionValidationMessage && !sessionDraft.provenanceNote.trim() ? <small className="field-validation">Provenance note is required.</small> : null}
              </label>
              <label>
                <span>Session notes</span>
                <textarea onChange={(event) => updateSessionDraft('notes', event.target.value)} placeholder="Optional editorial context" value={sessionDraft.notes} />
              </label>
              <button className="primary-button" disabled={saving} type="submit">
                <Plus size={14} />
                <span>Create Session</span>
              </button>
              {sessionValidationMessage ? <p className="inline-validation" role="alert">{sessionValidationMessage}</p> : null}
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
                <div className="editorial-session-picker-field">
                  <label>
                    <RequiredLabel>Session</RequiredLabel>
                    <select onChange={(event) => updateSourceDraft('importSessionId', event.target.value)} value={sourceDraft.importSessionId}>
                      <option value="">Choose a session</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>{formatSessionOption(session)}</option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button editorial-ingestion-header-button quiet" onClick={openNewSessionDraft} type="button">
                    <Plus size={14} />
                    <span>New Session</span>
                  </button>
                </div>
                <label>
                  <RequiredLabel>Source file</RequiredLabel>
                  <span className={`secondary-button source-file-picker-button ${selectingSourceFile ? 'selecting' : ''}`}>
                    <Paperclip size={14} />
                    <span>{sourceDraft.originalFilename || (selectingSourceFile ? 'Choosing source...' : 'Choose Source File')}</span>
                    <input
                      ref={sourceFileInputRef}
                      accept=".txt,.md,.pdf,.doc,.docx,text/plain,text/markdown"
                      className="source-file-native-input"
                      onChange={selectBrowserSourceFile}
                      onClick={markNativeSourcePickerOpening}
                      type="file"
                    />
                  </span>
                </label>
              </div>
              <div className="editorial-ingestion-grid">
                <label>
                  <RequiredLabel>Source label</RequiredLabel>
                  <input onChange={(event) => updateSourceDraft('sourceLabel', event.target.value)} placeholder="Original file or archive label" value={sourceDraft.sourceLabel} />
                </label>
                <label>
                  <RequiredLabel>Source type</RequiredLabel>
                  <select onChange={(event) => updateSourceDraft('sourceType', event.target.value)} value={sourceDraft.sourceType}>
                    {sourceTypePresets.map((preset) => (
                      <option key={preset.value} value={preset.value}>{preset.label}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <RequiredLabel>Provenance note</RequiredLabel>
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
              <button className="primary-button" disabled={saving || selectingSourceFile} onClick={openSourceFilePicker} type="button">
                <ShieldCheck size={14} />
                <span>Attach Source</span>
              </button>
              {sourceValidationMessage ? <p className="inline-validation" role="alert">{sourceValidationMessage}</p> : null}
              {sourceAttachmentMessage ? <p className="candidate-message source-attachment-message" role="status">{sourceAttachmentMessage}</p> : null}
              {lastAttachedSource ? (
                <div className="attached-source-confirmation" role="status">
                  <strong>Attached source saved</strong>
                  <span>{lastAttachedSource.source_label}</span>
                  <small>
                    Saved to {lastAttachedSource.session_title || 'selected import session'} / {formatSourceType(lastAttachedSource.source_type, lastAttachedSource.provenance_metadata?.custom_source_label)} / Source record #{lastAttachedSource.id}
                  </small>
                  <p>{lastAttachedSource.provenance_metadata?.source_note || 'Source provenance is preserved on the saved record.'}</p>
                </div>
              ) : null}
            </form>

            {selectedSourceDraftSources.length ? (
              <div className="session-source-list" aria-label="Attached sources">
                <div className="editorial-review-queue-heading">
                  <strong>Saved Attached Sources</strong>
                  <small>{selectedSourceDraftSources.length} saved to this session</small>
                </div>
                {selectedSourceDraftSources.slice(0, 4).map((source) => (
                  <article className={`session-source-row ${String(lastAttachedSourceId) === String(source.id) ? 'just-attached' : ''}`} key={source.id}>
                    <span className="source-type-badge">{formatSourceType(source.source_type, source.provenance_metadata?.custom_source_label)}</span>
                    <strong>{source.source_label}</strong>
                    <small>Source record #{source.id} / {formatDate(source.created_at)} / {source.provenance_metadata?.file_preview_state || 'staged'}</small>
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
                <RequiredLabel>Session</RequiredLabel>
                <select
                  ref={sessionSelectRef}
                  onChange={(event) => setCandidateDraft((draft) => ({
                    ...draft,
                    importSessionId: event.target.value,
                    sourceRecordId: '',
                    sourceLabel: '',
                    sourceType: 'draft-notes',
                    sourceTypeLabel: '',
                    provenanceNote: '',
                    rawContent: ''
                  }))}
                  value={candidateDraft.importSessionId}
                >
                  <option value="">Choose a session</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>{formatSessionOption(session)}</option>
                  ))}
                </select>
                {candidateValidationMessage && !candidateDraft.importSessionId ? <small className="field-validation">Choose a session.</small> : null}
              </label>
              <label>
                <RequiredLabel>Staged source</RequiredLabel>
                <select onChange={(event) => selectCandidateSource(event.target.value)} value={candidateDraft.sourceRecordId}>
                  <option value="">Choose a staged source</option>
                  {selectedCandidateSessionSources.map((source) => (
                    <option key={source.id} value={source.id}>{source.source_label}</option>
                  ))}
                </select>
                {candidateValidationMessage && !candidateDraft.sourceRecordId ? <small className="field-validation">Choose a staged source.</small> : null}
              </label>
            </div>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Source label</span>
                <input readOnly placeholder="Choose a staged source first" value={candidateDraft.sourceLabel} />
              </label>
              <label>
                <span>Source preset</span>
                <select disabled value={candidateDraft.sourceType}>
                  {sourceTypePresets.map((preset) => (
                    <option key={preset.value} value={preset.value}>{preset.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Custom label</span>
                <input readOnly placeholder="Optional archive label" value={candidateDraft.sourceTypeLabel} />
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
            <div className="editorial-ingestion-grid">
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
              <label>
                <span>Review state</span>
                <select onChange={(event) => updateCandidateDraft('reviewStatus', event.target.value)} value={candidateDraft.reviewStatus}>
                  {extractionReviewStates.map((state) => (
                    <option key={state.value} value={state.value}>{state.label}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              <RequiredLabel>Source provenance note</RequiredLabel>
              <input onChange={(event) => updateCandidateDraft('provenanceNote', event.target.value)} placeholder="Where this excerpt came from and why it is being staged" value={candidateDraft.provenanceNote} />
              {candidateValidationMessage && !candidateDraft.provenanceNote.trim() ? <small className="field-validation">Source provenance is required.</small> : null}
            </label>
            <label>
              <RequiredLabel>Raw source excerpt</RequiredLabel>
              <textarea readOnly placeholder="Choose a staged source to carry forward its preserved text" value={candidateDraft.rawContent} />
              {candidateValidationMessage && !candidateDraft.rawContent.trim() ? <small className="field-validation">Choose a staged source to load the excerpt.</small> : null}
            </label>
            <label>
              <RequiredLabel>Candidate title</RequiredLabel>
              <input onChange={(event) => updateCandidateDraft('title', event.target.value)} placeholder="Short review title" value={candidateDraft.title} />
              {candidateValidationMessage && !candidateDraft.title.trim() ? <small className="field-validation">Candidate title is required.</small> : null}
            </label>
            <label>
              <RequiredLabel>Candidate content</RequiredLabel>
              <textarea onChange={(event) => updateCandidateDraft('content', event.target.value)} placeholder="Manually extracted claim, note, or fragment" value={candidateDraft.content} />
              {candidateValidationMessage && !candidateDraft.content.trim() ? <small className="field-validation">Candidate content is required.</small> : null}
            </label>
            <label>
              <RequiredLabel>Trust note</RequiredLabel>
              <input onChange={(event) => updateCandidateDraft('trustReason', event.target.value)} placeholder={getConfidenceDefinition(candidateDraft.confidenceState)} value={candidateDraft.trustReason} />
              {candidateValidationMessage && !candidateDraft.trustReason.trim() ? <small className="field-validation">Trust note is required.</small> : null}
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
          {candidateValidationMessage ? <p className="inline-validation" role="alert">{candidateValidationMessage}</p> : null}
          {lastStagedReview ? (
            <div className="staged-review-confirmation" role="status">
              <strong>Review item staged</strong>
              <span>{lastStagedReview.title}</span>
              <small>{lastStagedReview.location} / {lastStagedReview.sourceLabel} / {lastStagedReview.status}</small>
              <p>The item is selected in the Review Workspace list. Open it there to inspect provenance, notes, and placement readiness. Canon is unchanged.</p>
              <p>Next: review this item, then Accept, Defer, or mark for placement. Canon remains unchanged.</p>
            </div>
          ) : null}
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
          <div className="editorial-state-legend" aria-label="Editorial state legend">
            <StateBadge state="staged-source" label="Staged Source" />
            <StateBadge state="extracted-candidate" label="Extracted Candidate" />
            <StateBadge state="contradiction-risk" label="Contradiction Risk" />
            <StateBadge state="duplicate-risk" label="Duplicate Risk" />
            <StateBadge state="accepted-placement" label="Accepted for Placement" />
            <StateBadge state="promoted-canon" label="Promoted Canon" />
          </div>
          {lastStagedReview ? (
            <div className="review-workspace-guidance" role="status">
              <strong>Latest staged item is ready for editorial review</strong>
              <span>{lastStagedReview.title}</span>
              <small>Selected below in the Review List / Canon remains unchanged</small>
              <p>Next: review this item, then Accept, Defer, or mark for placement. Canon remains unchanged.</p>
            </div>
          ) : (
            <p className="review-workspace-guidance subtle">Review items staged from sources appear here. Select an item to inspect provenance, resolve risks, or mark it ready for future placement.</p>
          )}
          <div className="editorial-triage-overview" aria-label="Extraction review overview for visible list">
            <ReviewFact label="Awaiting review" scope="in the list below" value={unresolvedCount} />
            <ReviewFact label="Continuity flags" scope="in the list below" value={contradictionCount} />
            <ReviewFact label="Duplicate checks" scope="in the list below" value={duplicateCount} />
            <ReviewFact label="Ready to place" scope="in the list below" value={acceptedCount} />
          </div>
          <div className="editorial-review-controls" aria-label="Review filters and batch actions">
            <label>
              <span>Review state</span>
              <select onChange={(event) => setReviewStateFilter(event.target.value)} value={reviewStateFilter}>
                <option value="all">All states</option>
                {extractionReviewStates.map((state) => (
                  <option key={state.value} value={state.value}>{state.label}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Risk</span>
              <select onChange={(event) => setRiskFilter(event.target.value)} value={riskFilter}>
                <option value="all">All review items</option>
                <option value="contradiction-risk">Contradiction risk</option>
                <option value="duplicate-risk">Duplicate risk</option>
                <option value="accepted-for-placement">Accepted for placement</option>
              </select>
            </label>
            <label className="editorial-batch-note">
              <span>Batch note</span>
              <input onChange={(event) => setBatchNote(event.target.value)} placeholder="Optional editorial note" value={batchNote} />
            </label>
            <div className="editorial-batch-actions">
              <small>{selectedExtractionCount} selected</small>
              <button className="secondary-button editorial-ingestion-header-button quiet" disabled={!selectedExtractionCount || saving} onClick={() => applyBatchTriage('deferred')} type="button">Defer</button>
              <button className="secondary-button editorial-ingestion-header-button quiet" disabled={!selectedExtractionCount || saving} onClick={() => applyBatchTriage('resolved')} type="button">Resolve</button>
              <button className="secondary-button editorial-ingestion-header-button quiet" disabled={!selectedExtractionCount || saving} onClick={() => applyBatchTriage('accepted-for-placement')} type="button">Accept</button>
            </div>
          </div>

          <div className="editorial-review-split">
            <nav className="editorial-review-queue" aria-label="Review queue">
              <div className="editorial-review-queue-heading">
                <strong>Review List</strong>
                <small>Staged review items awaiting editorial review</small>
              </div>
              <div className="editorial-ingestion-list">
                {sourceClusters.map((cluster) => {
                  const open = expandedSourceIds.includes(cluster.key);
                  const sourceUnresolved = cluster.items.filter((item) => !['resolved', 'deferred'].includes(item.status)).length;
                  const sourceAccepted = cluster.items.filter((item) => item.status === 'accepted-for-placement').length;
                  const allSelected = cluster.items.every((item) => selectedExtractionSet.has(String(item.id)));
                  return (
                    <section className="editorial-source-cluster" key={cluster.key}>
                      <div className="editorial-source-cluster-heading">
                        <button className="editorial-source-toggle" onClick={() => toggleCluster(cluster.key)} type="button">
                          <strong>{cluster.title}</strong>
                          <small>{cluster.meta} / {sourceUnresolved} unresolved / {sourceAccepted} placement ready</small>
                        </button>
                        <button aria-label="Select source cluster" className="icon-button" onClick={() => toggleClusterSelection(cluster.items)} title="Select source cluster" type="button">
                          {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                        </button>
                      </div>
                      {open ? cluster.items.map((item) => {
                        const isLatestStaged = lastStagedReview?.key === item.key;
                        return (
                        <div className={`editorial-triage-row ${isLatestStaged ? 'latest-staged-review' : ''}`} key={item.key}>
                          <button aria-label="Select extraction review item" className="icon-button" onClick={() => toggleExtractionSelection(item.id)} title="Select review item" type="button">
                            {selectedExtractionSet.has(String(item.id)) ? <CheckSquare size={15} /> : <Square size={15} />}
                          </button>
                          <button
                            aria-current={selectedReviewKey === item.key ? 'true' : undefined}
                            className={`editorial-ingestion-item ${selectedReviewKey === item.key ? 'selected' : ''}`}
                            onClick={() => setSelectedReviewKey(item.key)}
                            type="button"
                          >
                            <span>
                              <StateBadge state={getReviewStateKey(item)} label={getReviewStateLabel(item)} />
                              {isLatestStaged ? <em className="latest-staged-label">Newly staged</em> : null}
                              <strong>{item.title}</strong>
                              <small>{item.kind} / {formatDate(item.timestamp)}</small>
                            </span>
                            <StatusBadge status={formatReviewType(item.status)} />
                          </button>
                        </div>
                        );
                      }) : null}
                    </section>
                  );
                })}
                {!sourceClusters.length ? <p className="muted">No staged review items are visible for these filters yet. Attached sources are saved above first; once you stage an extraction candidate, it appears here for editorial review.</p> : null}
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
                    <StateBadge state={getReviewStateKey(selectedReviewItem)} label={getReviewStateLabel(selectedReviewItem)} />
                  </div>
                  <div className="editorial-review-meta-grid">
                    <ReviewFact label="Source" value={selectedReviewItem.sourceLabel || selectedReviewItem.provenance?.source_label || 'Source preserved'} />
                    <ReviewFact label="Type" value={formatSourceType(selectedReviewItem.sourceType, selectedReviewItem.sourceTypeLabel || selectedReviewItem.provenance?.custom_source_label)} />
                    <ReviewFact label="Triage" value={formatReviewType(selectedReviewItem.status)} />
                    <ReviewFact label="Confidence" value={formatConfidence(selectedReviewItem.confidence)} />
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
                  {selectedReviewItem.status === 'accepted-for-placement' ? (
                    <ReviewBlock label="Promotion readiness" value="Accepted for placement, still non-canon. Manual placement remains required before any canon record changes." />
                  ) : null}
                  {selectedReviewItem.status === 'contradiction-risk' ? (
                    <ReviewBlock label="Placement blocker" value="Contradiction risk is surfaced for review only. Resolve the continuity question before future canon placement." />
                  ) : null}
                  <ReviewBlock label="Review material" value={selectedReviewItem.content || selectedReviewItem.meta} />
                  <ReviewBlock label="Raw source excerpt" value={selectedReviewItem.excerpt || selectedReviewItem.provenance?.source_note || 'No raw excerpt is attached to this review item.'} />
                  <ReviewBlock label="Editorial note" value={selectedReviewItem.triageNote || selectedReviewItem.trustReason || selectedReviewItem.provenance?.source_note || 'No editorial note recorded.'} />
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

const extractionReviewStates = [
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'needs-review', label: 'Needs Review' },
  { value: 'contradiction-risk', label: 'Contradiction Risk' },
  { value: 'duplicate-risk', label: 'Duplicate Risk' },
  { value: 'accepted-for-placement', label: 'Accepted for Placement' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'resolved', label: 'Resolved' }
];

function StateBadge({ state, label }) {
  return <span className={`editorial-state-badge ${state}`}>{label}</span>;
}

function RequiredLabel({ children }) {
  return (
    <span>
      {children}
      <span aria-hidden="true" className="required-marker">*</span>
    </span>
  );
}

function ReviewFact({ label, scope, value }) {
  return (
    <div>
      <span>{label}</span>
      {scope ? <small>{scope}</small> : null}
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

function formatMissingFields(fields) {
  if (fields.length <= 1) return fields[0] || 'the required fields';
  if (fields.length === 2) return `${fields[0]} and ${fields[1]}`;
  return `${fields.slice(0, -1).join(', ')}, and ${fields[fields.length - 1]}`;
}

function getMissingSessionFields(draft) {
  return [
    !draft.title?.trim() ? 'a session title' : '',
    !draft.provenanceNote?.trim() ? 'a provenance note' : ''
  ].filter(Boolean);
}

function getMissingSourceFields(draft, provenanceNote) {
  return [
    !draft.importSessionId ? 'a session' : '',
    !draft.rawContent?.trim() ? 'a source file' : '',
    !draft.sourceLabel?.trim() ? 'a source label' : '',
    !provenanceNote ? 'a provenance note' : ''
  ].filter(Boolean);
}

function getMissingCandidateFields(draft) {
  return [
    !draft.importSessionId ? 'a session' : '',
    !draft.sourceRecordId ? 'a staged source' : '',
    !draft.provenanceNote?.trim() ? 'a source provenance note' : '',
    !draft.rawContent?.trim() ? 'a raw source excerpt' : '',
    !draft.title?.trim() ? 'a candidate title' : '',
    !draft.content?.trim() ? 'candidate content' : '',
    !draft.trustReason?.trim() ? 'a trust note' : ''
  ].filter(Boolean);
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

function getReviewStateKey(item = {}) {
  if (item.provenance?.promotions?.length || item.status === 'Promoted') return 'promoted-canon';
  if (item.kind === 'Staged Source') return 'staged-source';
  if (item.status === 'accepted-for-placement' || item.status === 'pending-placement') return 'accepted-placement';
  if (item.status === 'contradiction-risk') return 'contradiction-risk';
  if (item.status === 'duplicate-risk') return 'duplicate-risk';
  if (item.kind === 'Extraction Candidate' || item.kind === 'Narrative Fragment') return 'extracted-candidate';
  return 'extracted-candidate';
}

function getReviewStateLabel(item = {}) {
  if (item.kind === 'Staged Source') return 'Staged Source';
  if (item.status === 'accepted-for-placement' || item.status === 'pending-placement') return 'Accepted for Placement';
  if (item.status === 'contradiction-risk') return 'Contradiction Risk';
  if (item.status === 'duplicate-risk') return 'Duplicate Risk';
  if (item.provenance?.promotions?.length || item.status === 'Promoted') return 'Promoted Canon';
  return item.kind === 'Narrative Fragment' ? 'Extracted Fragment' : 'Extracted Candidate';
}

function normalizeExtractionTriageState(value) {
  const normalized = String(value || '').trim().toLowerCase().replace(/[_\s/]+/g, '-');
  const aliases = {
    unresolved: 'unreviewed',
    'in-review': 'needs-review',
    'pending-placement': 'accepted-for-placement',
    accepted: 'accepted-for-placement',
    reviewed: 'resolved',
    rejected: 'deferred'
  };
  const canonical = aliases[normalized] || normalized || 'unreviewed';
  return extractionReviewStates.some((state) => state.value === canonical) ? canonical : 'unreviewed';
}

function matchesReviewFilters(item, reviewStateFilter, riskFilter) {
  if (reviewStateFilter !== 'all' && item.status !== reviewStateFilter) return false;
  if (riskFilter !== 'all' && item.status !== riskFilter) return false;
  return true;
}

function compareReviewPriority(a = {}, b = {}) {
  const priority = {
    'contradiction-risk': 0,
    'duplicate-risk': 1,
    'needs-review': 2,
    unreviewed: 3,
    'accepted-for-placement': 4,
    deferred: 5,
    resolved: 6
  };
  const aPriority = priority[normalizeExtractionTriageState(a.status)] ?? 3;
  const bPriority = priority[normalizeExtractionTriageState(b.status)] ?? 3;
  if (aPriority !== bPriority) return aPriority - bPriority;
  return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
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

function buildAutoSessionTitle(filename) {
  const cleanName = String(filename || '').trim();
  if (cleanName) return `Intake: ${cleanName}`;
  return `Intake: ${new Date().toLocaleString()}`;
}

function buildAutoProvenanceNote(filename) {
  const cleanName = String(filename || '').trim();
  return cleanName
    ? `Staged from ${cleanName}. Edit this note if more source context is needed.`
    : 'Staged from a selected source file. Edit this note if more source context is needed.';
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
  if (['txt', 'md', 'markdown'].includes(normalized)) return 'imported-document';
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
