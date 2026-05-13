import { ArrowLeft, CheckSquare, FilePlus2, FileText, Flag, GitCompareArrows, Layers3, Paperclip, Plus, ShieldCheck, Square, Trash2, X } from 'lucide-react';
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
  const [lastSavedSourceSummary, setLastSavedSourceSummary] = useState(null);
  const [lastStagedReview, setLastStagedReview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectingSourceFile, setSelectingSourceFile] = useState(false);
  const [selectedReviewKey, setSelectedReviewKey] = useState(null);
  const [activeIntakeStep, setActiveIntakeStep] = useState('source-batch');
  const [reviewStateFilter, setReviewStateFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [batchSearchQuery, setBatchSearchQuery] = useState('');
  const [batchVisibleLimit, setBatchVisibleLimit] = useState(8);
  const [sourceSearchQuery, setSourceSearchQuery] = useState('');
  const [sourceSortOrder, setSourceSortOrder] = useState('newest');
  const [storedSourceVisibleLimit, setStoredSourceVisibleLimit] = useState(12);
  const [selectedReviewStatusDraft, setSelectedReviewStatusDraft] = useState('unreviewed');
  const [selectedReviewNote, setSelectedReviewNote] = useState('');
  const [selectedExtractionIds, setSelectedExtractionIds] = useState([]);
  const [batchNote, setBatchNote] = useState('');
  const [expandedSourceIds, setExpandedSourceIds] = useState(['unassigned']);
  const [removeReviewTarget, setRemoveReviewTarget] = useState(null);
  const [removeSourceTarget, setRemoveSourceTarget] = useState(null);
  const sessionTitleRef = useRef(null);
  const sessionSelectRef = useRef(null);
  const sourceFileInputRef = useRef(null);
  const ingestionIntakeRef = useRef(null);
  const sourceMaterialSectionRef = useRef(null);
  const ingestionReviewSummary = useRevivalStore((state) => state.ingestionReviewSummary);
  const activeIngestionReviewKey = useRevivalStore((state) => state.activeIngestionReviewKey);
  const clearActiveIngestionReviewKey = useRevivalStore((state) => state.clearActiveIngestionReviewKey);
  const createImportSession = useRevivalStore((state) => state.createImportSession);
  const createStagedSource = useRevivalStore((state) => state.createStagedSource);
  const createManualExtractionCandidate = useRevivalStore((state) => state.createManualExtractionCandidate);
  const updateExtractionReviewTriage = useRevivalStore((state) => state.updateExtractionReviewTriage);
  const removeExtractionReviewItem = useRevivalStore((state) => state.removeExtractionReviewItem);
  const removeStoredSourceMaterial = useRevivalStore((state) => state.removeStoredSourceMaterial);
  const showToast = useRevivalStore((state) => state.showToast);
  const sessions = ingestionReviewSummary.sessions || [];
  const sourceRecords = (ingestionReviewSummary.sourceRecords || []).filter(isActiveSourceMaterial);
  const selectedSourceDraftSources = sourceRecords.filter((source) => String(source.import_session_id || '') === String(sourceDraft.importSessionId || ''));
  const activeSourceCount = sourceRecords.length;
  const sourceBatches = useMemo(
    () => buildIndexedSourceBatches(sessions, sourceRecords),
    [sessions, sourceRecords]
  );
  const filteredBatches = useMemo(
    () => filterSourceBatches(sourceBatches, batchSearchQuery),
    [sourceBatches, batchSearchQuery]
  );
  const visibleBatches = filteredBatches.slice(0, batchVisibleLimit);
  const filteredStoredSources = useMemo(
    () => sortStoredSources(filterStoredSources(sourceRecords, sourceSearchQuery), sourceSortOrder),
    [sourceRecords, sourceSearchQuery, sourceSortOrder]
  );
  const visibleStoredSources = filteredStoredSources.slice(0, storedSourceVisibleLimit);
  const storedSourceScopeLabel = sourceSearchQuery.trim() ? 'matching this search' : 'stored across source batches';
  const selectedCandidateSessionSources = useMemo(() => {
    const candidateSessionId = String(candidateDraft.importSessionId || '');
    const selectedSourceId = String(candidateDraft.sourceRecordId || lastAttachedSourceId || '');
    return sourceRecords.filter((source) => {
      if (source.provenance_metadata?.memory_layer === 'editorial') return false;
      const sourceSessionId = String(source.import_session_id || source.provenance_metadata?.import_session_id || '');
      return (candidateSessionId && sourceSessionId === candidateSessionId) || (selectedSourceId && String(source.id) === selectedSourceId);
    });
  }, [candidateDraft.importSessionId, candidateDraft.sourceRecordId, lastAttachedSourceId, sourceRecords]);
  const stagedItems = useMemo(() => [
    ...(ingestionReviewSummary.sourceRecords || []).map((item) => ({
      key: `source-${item.id}`,
      id: item.id,
      kind: 'Source Material',
      title: item.source_label,
      meta: `${formatSourceType(item.source_type, item.provenance_metadata?.custom_source_label)} / ${item.session_title || 'Source batch linked'}`,
      status: item.provenance_metadata?.file_preview_state || 'staged',
      timestamp: item.created_at,
      sourceLabel: item.source_label,
      sourceType: item.source_type,
      sourceTypeLabel: item.provenance_metadata?.custom_source_label,
      excerpt: item.raw_content,
      content: item.provenance_metadata?.file_preview_note || 'Source material is saved and awaiting review.',
      provenance: item.provenance_metadata
    })),
    ...(ingestionReviewSummary.unresolvedExtractions || []).map((item) => ({
      key: `extraction-${item.id}`,
      id: item.id,
      sourceRecordId: item.source_record_id,
      kind: 'Review Item',
      title: item.title,
      meta: `${formatReviewType(item.classification)} / ${item.source_label || item.provenance_metadata?.source_label || item.provenance_metadata?.removed_source_label || 'Source preserved'}`,
      status: normalizeExtractionTriageState(item.status),
      confidence: item.confidence_state,
      classification: item.classification,
      timestamp: item.updated_at || item.created_at,
      sourceLabel: item.source_label || item.provenance_metadata?.source_label || item.provenance_metadata?.removed_source_label,
      sourceType: item.source_type || item.provenance_metadata?.source_type || item.provenance_metadata?.removed_source_type,
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
      sourceLabel: item.source_label || item.provenance_metadata?.source_label || item.provenance_metadata?.removed_source_label,
      sourceType: item.source_type || item.provenance_metadata?.source_type || item.provenance_metadata?.removed_source_type,
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
  const extractionItems = useMemo(() => stagedItems.filter((item) => item.kind === 'Review Item'), [stagedItems]);
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
  const acceptedCount = visibleTriageCounts['accepted-for-placement'] || 0;
  const unresolvedCount = visibleReviewItems.filter((item) => !['resolved', 'deferred'].includes(item.status)).length;
  const contradictionCount = visibleTriageCounts['contradiction-risk'] || 0;
  const duplicateCount = visibleTriageCounts['duplicate-risk'] || 0;
  const removeSourceImpact = removeSourceTarget ? getSourceRemovalImpact(removeSourceTarget, ingestionReviewSummary) : null;

  useEffect(() => {
    if (selectedReviewKey && !stagedItems.some((item) => item.key === selectedReviewKey)) {
      setSelectedReviewKey(stagedItems[0]?.key || null);
    }
  }, [selectedReviewKey, stagedItems]);

  useEffect(() => {
    if (selectedReviewItem?.kind !== 'Review Item') return;
    setSelectedReviewStatusDraft(selectedReviewItem.status || 'unreviewed');
    setSelectedReviewNote(selectedReviewItem.triageNote || '');
  }, [selectedReviewItem]);

  useEffect(() => {
    if (!activeIngestionReviewKey) return;
    const routedItem = stagedItems.find((item) => item.key === activeIngestionReviewKey);
    if (!routedItem) return;

    setReviewStateFilter('all');
    setRiskFilter('all');
    setSelectedReviewKey(routedItem.key);
    if (routedItem.sourceRecordId) {
      setExpandedSourceIds((ids) => [...new Set([...ids, String(routedItem.sourceRecordId)])]);
    }
    clearActiveIngestionReviewKey();
  }, [activeIngestionReviewKey, clearActiveIngestionReviewKey, stagedItems]);

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

  useEffect(() => {
    setStoredSourceVisibleLimit(12);
  }, [sourceSearchQuery, sourceSortOrder, sourceDraft.importSessionId, activeSourceCount]);

  useEffect(() => {
    setBatchVisibleLimit(8);
  }, [batchSearchQuery, sourceBatches.length]);

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
  const selectSourceBatchForMaterial = (importSessionId) => {
    setSourceDraft((draft) => ({
      ...initialSourceDraft,
      importSessionId,
      sourceType: draft.sourceType,
      sourceTypeLabel: draft.sourceTypeLabel
    }));
    setCandidateDraft((draft) => ({
      ...draft,
      importSessionId,
      sourceRecordId: '',
      sourceLabel: '',
      provenanceNote: '',
      rawContent: ''
    }));
    setLastAttachedSourceId(null);
    setLastSavedSourceSummary(null);
    setSourceAttachmentMessage('');
    setSourceValidationMessage('');
  };
  const showSourceMaterialStep = () => {
    setActiveIntakeStep('source-material');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const sourceSection = sourceMaterialSectionRef.current;
        const intakePanel = ingestionIntakeRef.current;
        if (!sourceSection) return;

        sourceSection.scrollTop = 0;
        if (intakePanel) {
          intakePanel.scrollTo({
            top: Math.max(0, sourceSection.offsetTop - intakePanel.offsetTop),
            behavior: 'smooth'
          });
        } else {
          sourceSection.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
        sourceSection.focus({ preventScroll: true });
      });
    });
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
      setMessage(response?.message || 'Editorial review could not be saved.');
      return;
    }
    setSelectedExtractionIds([]);
    setBatchNote('');
    setMessage(`${formatReviewType(status)} saved for selected review items.`);
  };
  const applySelectedReviewTriage = async (status = selectedReviewStatusDraft) => {
    if (!selectedReviewItem || selectedReviewItem.kind !== 'Review Item') return;
    setSaving(true);
    const response = await updateExtractionReviewTriage({ id: selectedReviewItem.id, status, note: selectedReviewNote });
    setSaving(false);
    if (!response?.ok) {
      setMessage(response?.message || 'Editorial review could not be saved.');
      return;
    }
    setReviewStateFilter('all');
    setRiskFilter('all');
    setSelectedReviewStatusDraft(status);
    setSelectedReviewKey(selectedReviewItem.key);
    setMessage(`${formatReviewType(status)} saved for ${selectedReviewItem.title}. Canon remains unchanged.`);
  };
  const requestReviewRemoval = (item) => {
    if (!item || item.kind !== 'Review Item') return;
    setRemoveReviewTarget(item);
  };
  const cancelReviewRemoval = () => {
    if (saving) return;
    setRemoveReviewTarget(null);
  };
  const confirmReviewRemoval = async () => {
    if (!removeReviewTarget || saving) return;
    setSaving(true);
    const response = await removeExtractionReviewItem({
      id: removeReviewTarget.id,
      note: 'Removed from Review Queue by editor. Source material and canon unchanged.'
    });
    setSaving(false);
    if (!response?.ok) {
      setMessage(response?.message || 'Review item could not be removed.');
      return;
    }
    setSelectedExtractionIds((ids) => ids.filter((id) => String(id) !== String(removeReviewTarget.id)));
    if (selectedReviewKey === removeReviewTarget.key) setSelectedReviewKey(null);
    setRemoveReviewTarget(null);
    setMessage(`Review item removed from the Review Queue. Source material remains stored: ${removeReviewTarget.sourceLabel || 'attached source'}. Canon unchanged.`);
  };
  const requestSourceRemoval = (source) => {
    if (!source?.id) return;
    setRemoveSourceTarget(source);
  };
  const cancelSourceRemoval = () => {
    if (saving) return;
    setRemoveSourceTarget(null);
  };
  const confirmSourceRemoval = async () => {
    if (!removeSourceTarget || saving) return;
    setSaving(true);
    const response = await removeStoredSourceMaterial({
      id: removeSourceTarget.id,
      note: 'Source material removed by editor. Linked review items preserved without this source. Accepted canon unchanged.'
    });
    setSaving(false);
    if (!response?.ok) {
      setMessage(response?.message || 'Source material could not be removed.');
      return;
    }
    const removedSourceId = String(removeSourceTarget.id);
    if (String(lastAttachedSourceId) === removedSourceId) setLastAttachedSourceId(null);
    if (String(lastSavedSourceSummary?.id) === removedSourceId) setLastSavedSourceSummary(null);
    setSourceDraft((draft) => {
      const draftMatchesRemovedSource = String(lastAttachedSourceId) === removedSourceId
        || String(draft.sourceLabel || '') === String(removeSourceTarget.source_label || '')
        || String(draft.originalFilename || '') === String(removeSourceTarget.provenance_metadata?.original_filename || '');
      if (!draftMatchesRemovedSource) return draft;
      return {
        ...initialSourceDraft,
        importSessionId: draft.importSessionId,
        sourceType: draft.sourceType,
        sourceTypeLabel: draft.sourceTypeLabel
      };
    });
    if (String(candidateDraft.sourceRecordId) === removedSourceId) {
      setCandidateDraft((draft) => ({
        ...draft,
        sourceRecordId: '',
        sourceLabel: '',
        provenanceNote: '',
        rawContent: ''
      }));
    }
    setSelectedExtractionIds((ids) => ids.filter((id) => {
      const item = extractionItems.find((reviewItem) => String(reviewItem.id) === String(id));
      return String(item?.sourceRecordId || '') !== removedSourceId;
    }));
    setRemoveSourceTarget(null);
    const removedSourceIdentity = getSourceIdentity(removeSourceTarget);
    const confirmation = `${removedSourceIdentity.primary} (${removedSourceIdentity.recordLabel}) removed from Stored Source Material. Accepted canon unchanged.`;
    setSourceAttachmentMessage(confirmation);
    setMessage(`${confirmation} Linked review items remain in review without that source.`);
    showToast(confirmation);
  };

  const openNewSessionDraft = () => {
    setSessionDraft(initialSessionDraft);
    setSourceDraft(initialSourceDraft);
    setCandidateDraft(initialCandidateDraft);
    setLastAttachedSourceId(null);
    setLastSavedSourceSummary(null);
    setSourceAttachmentMessage('');
    setSessionValidationMessage('');
    setSourceValidationMessage('');
    setCandidateValidationMessage('');
    setActiveIntakeStep('source-batch');
    setMessage('New source batch ready. Add provenance before saving.');
    setTimeout(() => sessionTitleRef.current?.focus(), 0);
  };

  const reviewSessions = () => {
    setTimeout(() => sessionSelectRef.current?.focus(), 0);
  };

  const saveSession = async (event) => {
    event.preventDefault();
    const missing = getMissingSessionFields(sessionDraft);
    if (missing.length) {
      setSessionValidationMessage(`Before creating a source batch, add ${formatMissingFields(missing)}.`);
      setMessage('Batch title and provenance note are required.');
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
      setMessage(response?.message || 'Source batch could not be saved.');
      return;
    }

    setSessionValidationMessage('');
    setCandidateDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSourceDraft((draft) => ({ ...draft, importSessionId: String(response.session.id) }));
    setSessionDraft(initialSessionDraft);
    setMessage('Source batch saved. Nothing has been added to canon yet.');
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
      notes: 'Created when a source file was added for review.',
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
      setMessage(response?.message || 'Source batch could not be prepared for this material.');
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
      setMessage('Source batch, source file, source label, and provenance note are required.');
      return { ok: false };
    }

    setSaving(true);
    const response = await createStagedSource({
      ...draftToSave,
      provenanceNote
    });
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Source material could not be saved.');
      setSourceAttachmentMessage(response?.message || 'Source could not be attached.');
      return response;
    }

    setSourceValidationMessage('');
    const savedSessionId = String(response.source.import_session_id || draftToSave.importSessionId || '');
    setSourceDraft((draft) => ({
      ...initialSourceDraft,
      importSessionId: savedSessionId || draft.importSessionId,
      sourceType: draftToSave.sourceType || draft.sourceType,
      sourceTypeLabel: draftToSave.sourceTypeLabel || draft.sourceTypeLabel
    }));
    setLastAttachedSourceId(response.source.id);
    setLastSavedSourceSummary({
      id: response.source.id,
      label: response.source.source_label || draftToSave.sourceLabel,
      sessionTitle: response.source.session_title || sessions.find((session) => String(session.id) === savedSessionId)?.title || 'selected source batch',
      sourceType: response.source.source_type || draftToSave.sourceType,
      sourceTypeLabel: response.source.provenance_metadata?.custom_source_label || draftToSave.sourceTypeLabel || ''
    });
    setCandidateDraft((draft) => ({
      ...draft,
      importSessionId: savedSessionId || draft.importSessionId || '',
      sourceRecordId: String(response.source.id),
      sourceLabel: response.source.source_label || draftToSave.sourceLabel,
      sourceType: response.source.source_type || draftToSave.sourceType,
      sourceTypeLabel: response.source.provenance_metadata?.custom_source_label || draftToSave.sourceTypeLabel || '',
      provenanceNote: response.source.provenance_metadata?.source_note || draftToSave.provenanceNote || '',
      rawContent: response.source.raw_content || draftToSave.rawContent || ''
    }));
    setSourceAttachmentMessage('Source material saved. Current source preview cleared; source is stored in Stored Source Material.');
    setMessage('Source material saved to its batch. It remains review-only and non-canon.');
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
      sourceLabel: file.name,
      sourceType: detectedType,
      provenanceNote: buildAutoProvenanceNote(file.name),
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
      setCandidateValidationMessage(`Before adding this item to the Review Queue, add ${formatMissingFields(missing)}.`);
      setMessage('Source batch, source material, provenance note, source text, story detail title, story note, and trust note are required.');
      return;
    }

    setSaving(true);
    const response = await createManualExtractionCandidate(candidateDraft);
    setSaving(false);

    if (!response?.ok) {
      setMessage(response?.message || 'Review item could not be saved.');
      return;
    }

    const reviewKey = response.review?.id ? `extraction-${response.review.id}` : null;
    const sourceKey = String(candidateDraft.sourceRecordId || 'unassigned');
    setCandidateValidationMessage('');
    setLastStagedReview({
      key: reviewKey,
      title: response.review?.title || candidateDraft.title,
      sourceLabel: candidateDraft.sourceLabel || 'selected source',
      location: reviewKey ? 'Editorial Review / Review Queue' : 'Editorial Review',
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
    setMessage('Review item added to the Review Queue. Nothing has been added to canon yet.');
  };

  return (
    <section className="view editorial-ingestion-view">
      <header className="candidate-header">
        <div>
          <div className="eyebrow">Editorial Intake</div>
          <h1>Review source material safely</h1>
          <p className="dashboard-lede">
            File source material with provenance, turn useful notes into review items, and keep every detail out of canon until it is deliberately accepted later.
          </p>
        </div>
        <div className="editorial-ingestion-header-actions" aria-label="Editorial ingestion session actions">
          <button className="secondary-button editorial-ingestion-header-button" onClick={openNewSessionDraft} type="button">
            <Plus size={14} />
            <span>New Source Batch</span>
          </button>
          {sessions.length ? (
            <button className="secondary-button editorial-ingestion-header-button quiet" onClick={reviewSessions} type="button">
              <span>Review Batches</span>
            </button>
          ) : null}
        </div>
      </header>

      <div className="editorial-ingestion-layout">
        <div className="editorial-ingestion-intake" ref={ingestionIntakeRef}>
          <div className="editorial-intake-workflow" aria-label="Editorial intake workflow">
            {intakeSteps.map((step, index) => (
              <button
                aria-current={activeIntakeStep === step.key ? 'step' : undefined}
                className={activeIntakeStep === step.key ? 'active' : ''}
                key={step.key}
                onClick={() => (step.key === 'source-material' ? showSourceMaterialStep() : setActiveIntakeStep(step.key))}
                type="button"
              >
                <small>{index + 1}</small>
                <span>{step.label}</span>
              </button>
            ))}
          </div>
          <p className="editorial-intake-guidance">
            Create or select a source batch, attach source material, then add story details to review. Canon stays unchanged.
          </p>

          <section className={`editorial-ingestion-panel intake-step-panel ${activeIntakeStep === 'source-batch' ? 'active' : ''}`} aria-labelledby="import-session-heading" hidden={activeIntakeStep !== 'source-batch'}>
            <div className="editorial-ingestion-heading">
              <FilePlus2 size={17} />
              <div>
                <h2 id="import-session-heading">Source Batch</h2>
                <span>A quiet filing group for source material. Canon stays unchanged.</span>
              </div>
            </div>
            <form className="editorial-ingestion-form" onSubmit={saveSession}>
              <label>
                <RequiredLabel>Batch title</RequiredLabel>
                <input ref={sessionTitleRef} onChange={(event) => updateSessionDraft('title', event.target.value)} placeholder="Chapter notes, May pass" value={sessionDraft.title} />
                {sessionValidationMessage && !sessionDraft.title.trim() ? <small className="field-validation">Batch title is required.</small> : null}
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
                <input onChange={(event) => updateSessionDraft('provenanceNote', event.target.value)} placeholder="Where this source material came from" value={sessionDraft.provenanceNote} />
                {sessionValidationMessage && !sessionDraft.provenanceNote.trim() ? <small className="field-validation">Provenance note is required.</small> : null}
              </label>
              <label>
                <span>Batch notes</span>
                <textarea onChange={(event) => updateSessionDraft('notes', event.target.value)} placeholder="Optional editorial context" value={sessionDraft.notes} />
              </label>
              <button className="primary-button" disabled={saving} type="submit">
                <Plus size={14} />
                <span>Create Source Batch</span>
              </button>
              {sessionValidationMessage ? <p className="inline-validation" role="alert">{sessionValidationMessage}</p> : null}
            </form>
            <div className="source-batch-browser" aria-label="Source batch list">
              <div className="editorial-review-queue-heading stored-source-heading">
                <strong>Source Batches</strong>
                <small>
                  {sourceBatches.length
                    ? `${filteredBatches.length} of ${sourceBatches.length} source batch${sourceBatches.length === 1 ? '' : 'es'} ${batchSearchQuery.trim() ? 'matching this search' : 'stored for source material'}`
                    : '0 source batches'}
                </small>
              </div>
              <div className="stored-source-tools">
                <label>
                  <span>Find source batch</span>
                  <input
                    onChange={(event) => setBatchSearchQuery(event.target.value)}
                    placeholder="Search title, type, provenance, or notes"
                    value={batchSearchQuery}
                  />
                </label>
              </div>
              {sourceBatches.length ? (
                <>
                  {visibleBatches.length ? (
                    <div className="source-batch-list">
                      {visibleBatches.map((session) => (
                        <article className="source-batch-row" key={session.id}>
                          <div>
                            <strong>{session.title || `Source batch #${session.id}`}</strong>
                            <small>{formatSourceType(session.source_type, session.provenance_metadata?.custom_source_label)} / {formatDate(session.created_at)}</small>
                          </div>
                          <p>{session.provenance_metadata?.source_note || session.notes || 'No provenance note recorded yet.'}</p>
                          <small>{Number(session.source_count || 0)} active source{Number(session.source_count || 0) === 1 ? '' : 's'} / Archive and remove controls remain future review work.</small>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="stored-source-empty-state" role="status">
                      <strong>No batches match this search.</strong>
                      <p>Clear or change the search to browse stored source batches again.</p>
                    </div>
                  )}
                  {filteredBatches.length > visibleBatches.length ? (
                    <button className="secondary-button stored-source-show-more" onClick={() => setBatchVisibleLimit((limit) => limit + 8)} type="button">
                      Show More Batches
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="stored-source-empty-state" role="status">
                  <strong>No source batches yet.</strong>
                  <p>Create a source batch above or attach source material to create one automatically. Canon stays unchanged.</p>
                </div>
              )}
            </div>
          </section>

          <section className={`editorial-ingestion-panel intake-step-panel source-material-step ${activeIntakeStep === 'source-material' ? 'active' : ''}`} aria-labelledby="staged-source-heading" hidden={activeIntakeStep !== 'source-material'} ref={sourceMaterialSectionRef} tabIndex={-1}>
            <div className="editorial-ingestion-heading">
              <Paperclip size={17} />
              <div>
                <h2 id="staged-source-heading">Source Material</h2>
                <span>Add a local source for review. Canon unchanged.</span>
              </div>
            </div>

            <div className="session-source-list" aria-label="Stored source material">
              <div className="editorial-review-queue-heading stored-source-heading">
                <strong>Stored Source Material</strong>
                <small>
                  {activeSourceCount
                    ? `${filteredStoredSources.length} of ${activeSourceCount} active stored source${activeSourceCount === 1 ? '' : 's'} ${storedSourceScopeLabel} / newest first`
                    : '0 active stored sources'}
                </small>
              </div>
              {activeSourceCount ? (
                <>
                  <div className="stored-source-tools">
                    <label>
                      <span>Find source material</span>
                      <input
                        onChange={(event) => setSourceSearchQuery(event.target.value)}
                        placeholder="Search title, filename, batch, type, or status"
                        value={sourceSearchQuery}
                      />
                    </label>
                    <label>
                      <span>Sort sources</span>
                      <select onChange={(event) => setSourceSortOrder(event.target.value)} value={sourceSortOrder}>
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="title">Title A-Z</option>
                      </select>
                    </label>
                    {sourceDraft.importSessionId ? <small>{selectedSourceDraftSources.length} active in selected batch</small> : null}
                  </div>
                  <p className="source-storage-anchor">Return here to find attached sources later. They persist independently of Review Queue items.</p>
                  {visibleStoredSources.length ? visibleStoredSources.map((source) => (
                    <article className={`session-source-row ${String(lastAttachedSourceId) === String(source.id) ? 'just-attached' : ''}`} key={source.id}>
                      {(() => {
                        const sourceIdentity = getSourceIdentity(source);
                        return (
                          <>
                            <span className="source-type-badge">{formatSourceType(source.source_type, source.provenance_metadata?.custom_source_label)}</span>
                            <div className="session-source-row-main">
                              <strong>{sourceIdentity.primary}</strong>
                              <small>{sourceIdentity.detail} / {formatDate(source.created_at)} / {source.provenance_metadata?.file_preview_state || 'staged'}</small>
                            </div>
                            <div className="session-source-row-footer">
                              <small>{sourceIdentity.recordLabel}</small>
                              <button
                                aria-label={`Remove stored source material ${sourceIdentity.primary} ${sourceIdentity.recordLabel}`}
                                className="quiet-danger-button stored-source-remove-button"
                                disabled={saving}
                                onClick={() => requestSourceRemoval(source)}
                                title="Remove stored source material"
                                type="button"
                              >
                                <Trash2 size={14} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </article>
                  )) : (
                    <div className="stored-source-empty-state" role="status">
                      <strong>No sources match this search.</strong>
                      <p>Clear or change the search to browse active Stored Source Material again.</p>
                    </div>
                  )}
                  {filteredStoredSources.length > visibleStoredSources.length ? (
                    <button className="secondary-button stored-source-show-more" onClick={() => setStoredSourceVisibleLimit((limit) => limit + 12)} type="button">
                      Show More Sources
                    </button>
                  ) : null}
                </>
              ) : (
                <div className="stored-source-empty-state" role="status">
                  <strong>No active stored sources yet.</strong>
                  <p>Attach source material on this page to begin this shelf. Search, Show More, and Remove appear after at least one active stored source exists.</p>
                  <small>Review Queue notes can still keep preserved source history, but there is nothing active to browse or remove here right now.</small>
                </div>
              )}
            </div>

            <form className="editorial-ingestion-form source-material-attach-form" onSubmit={saveSource}>
              <div className="editorial-ingestion-grid">
                <div className="editorial-session-picker-field">
                  <label>
                    <RequiredLabel>Source batch</RequiredLabel>
                    <select onChange={(event) => selectSourceBatchForMaterial(event.target.value)} value={sourceDraft.importSessionId}>
                      <option value="">Choose a source batch</option>
                      {sessions.map((session) => (
                        <option key={session.id} value={session.id}>{formatSessionOption(session)}</option>
                      ))}
                    </select>
                  </label>
                  <button className="secondary-button editorial-ingestion-header-button quiet" onClick={openNewSessionDraft} type="button">
                    <Plus size={14} />
                    <span>New Batch</span>
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
              <div className="source-preview-card" aria-label="Current Source Material draft preview">
                <div>
                  <FileText size={15} />
                  <strong>{sourceDraft.originalFilename || 'Current Source Material draft'}</strong>
                  {sourceDraft.fileSize ? <small>{formatBytes(sourceDraft.fileSize)} / {formatReviewType(sourceDraft.previewState)}</small> : <small>TXT and MD preview lightly; binaries stay as placeholders.</small>}
                </div>
                <p>{sourceDraft.rawContent || 'Select a local source to file it in the current source batch.'}</p>
              </div>
              <button className="primary-button" disabled={saving || selectingSourceFile} onClick={openSourceFilePicker} type="button">
                <ShieldCheck size={14} />
                <span>Attach Source</span>
              </button>
              {sourceValidationMessage ? <p className="inline-validation" role="alert">{sourceValidationMessage}</p> : null}
              {sourceAttachmentMessage ? <p className="candidate-message source-attachment-message" role="status">{sourceAttachmentMessage}</p> : null}
              {lastSavedSourceSummary ? (
                <div className="source-saved-summary" role="status">
                  <strong>Last saved source</strong>
                  <span>{lastSavedSourceSummary.label}</span>
                  <small>
                    Stored as source record #{lastSavedSourceSummary.id} / {lastSavedSourceSummary.sessionTitle} / {formatSourceType(lastSavedSourceSummary.sourceType, lastSavedSourceSummary.sourceTypeLabel)}
                  </small>
                </div>
              ) : null}
            </form>
          </section>

          <section className={`editorial-ingestion-panel intake-step-panel ${activeIntakeStep === 'story-detail' ? 'active' : ''}`} aria-labelledby="extraction-candidate-heading" hidden={activeIntakeStep !== 'story-detail'}>
            <div className="editorial-ingestion-heading">
              <Layers3 size={17} />
              <div>
                <h2 id="extraction-candidate-heading">Story Detail</h2>
                <span>Add a note to editorial review. Canon unchanged.</span>
              </div>
            </div>
            <form className="editorial-ingestion-form" onSubmit={saveCandidate}>
            <div className="editorial-ingestion-grid">
              <label>
                <RequiredLabel>Source batch</RequiredLabel>
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
                  <option value="">Choose a source batch</option>
                  {sessions.map((session) => (
                    <option key={session.id} value={session.id}>{formatSessionOption(session)}</option>
                  ))}
                </select>
                {candidateValidationMessage && !candidateDraft.importSessionId ? <small className="field-validation">Choose a source batch.</small> : null}
              </label>
              <label>
                <RequiredLabel>Source material</RequiredLabel>
                <select onChange={(event) => selectCandidateSource(event.target.value)} value={candidateDraft.sourceRecordId}>
                  <option value="">Choose source material</option>
                  {selectedCandidateSessionSources.map((source) => (
                    <option key={source.id} value={source.id}>{formatSourceOption(source)}</option>
                  ))}
                </select>
                {candidateValidationMessage && !candidateDraft.sourceRecordId ? <small className="field-validation">Choose saved source material.</small> : null}
              </label>
            </div>
            <div className="editorial-ingestion-grid">
              <label>
                <span>Source label</span>
                <input readOnly placeholder="Choose source material first" value={candidateDraft.sourceLabel} />
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
                  <option value="candidate">Story detail</option>
                  <option value="unresolved-question">Unresolved question</option>
                  <option value="possible-duplicate">Possible duplicate</option>
                  <option value="continuity-risk">Continuity concern</option>
                  <option value="contradiction">Continuity conflict</option>
                  <option value="narrative-fragment">Story note</option>
                  <option value="pending-placement">Ready to file</option>
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
              <input onChange={(event) => updateCandidateDraft('provenanceNote', event.target.value)} placeholder="Where this excerpt came from and why it belongs in review" value={candidateDraft.provenanceNote} />
              {candidateValidationMessage && !candidateDraft.provenanceNote.trim() ? <small className="field-validation">Source provenance is required.</small> : null}
            </label>
            <label>
              <RequiredLabel>Raw source excerpt</RequiredLabel>
              <textarea readOnly placeholder="Choose source material to carry forward its preserved text" value={candidateDraft.rawContent} />
              {candidateValidationMessage && !candidateDraft.rawContent.trim() ? <small className="field-validation">Choose source material to load the excerpt.</small> : null}
            </label>
            <label>
              <RequiredLabel>Story detail title</RequiredLabel>
              <input onChange={(event) => updateCandidateDraft('title', event.target.value)} placeholder="Short review title" value={candidateDraft.title} />
              {candidateValidationMessage && !candidateDraft.title.trim() ? <small className="field-validation">Story detail title is required.</small> : null}
            </label>
            <label>
              <RequiredLabel>Story note</RequiredLabel>
              <textarea onChange={(event) => updateCandidateDraft('content', event.target.value)} placeholder="Claim, note, or fragment to review" value={candidateDraft.content} />
              {candidateValidationMessage && !candidateDraft.content.trim() ? <small className="field-validation">Story note is required.</small> : null}
            </label>
            <label>
              <RequiredLabel>Trust note</RequiredLabel>
              <input onChange={(event) => updateCandidateDraft('trustReason', event.target.value)} placeholder={getConfidenceDefinition(candidateDraft.confidenceState)} value={candidateDraft.trustReason} />
              {candidateValidationMessage && !candidateDraft.trustReason.trim() ? <small className="field-validation">Trust note is required.</small> : null}
            </label>
            <div className="editorial-routing-options">
              <label>
                <input checked={candidateDraft.flagDuplicate} onChange={(event) => updateCandidateDraft('flagDuplicate', event.target.checked)} type="checkbox" />
                <span><GitCompareArrows size={14} /> Mark possible duplicate</span>
              </label>
              {candidateDraft.flagDuplicate ? (
                <input onChange={(event) => updateCandidateDraft('duplicateReason', event.target.value)} placeholder="Duplicate review note" value={candidateDraft.duplicateReason} />
              ) : null}
              <label>
                <input checked={candidateDraft.flagContradiction} onChange={(event) => updateCandidateDraft('flagContradiction', event.target.checked)} type="checkbox" />
                <span><Flag size={14} /> Mark continuity concern</span>
              </label>
              {candidateDraft.flagContradiction ? (
                <input onChange={(event) => updateCandidateDraft('contradictionClaim', event.target.value)} placeholder="Existing claim to compare against" value={candidateDraft.contradictionClaim} />
              ) : null}
            </div>
            <button className="primary-button" disabled={saving} type="submit">
              <ShieldCheck size={14} />
              <span>Add to Review Queue</span>
            </button>
          </form>
          {candidateValidationMessage ? <p className="inline-validation" role="alert">{candidateValidationMessage}</p> : null}
          {lastStagedReview ? (
            <div className="staged-review-confirmation" role="status">
              <strong>Review item added</strong>
              <span>{lastStagedReview.title}</span>
              <small>{lastStagedReview.location} / {lastStagedReview.sourceLabel} / {lastStagedReview.status}</small>
              <p>The item is selected in Editorial Review. Open it there to inspect provenance, notes, and filing readiness. Nothing has been added to canon yet.</p>
              <p>Next: review this item, then defer it, mark it reviewed, or mark it ready to file.</p>
            </div>
          ) : null}
          {message ? <p className="candidate-message" role="status">{message}</p> : null}
          </section>
        </div>

        <section className="editorial-ingestion-panel editorial-review-workspace" aria-labelledby="staged-review-heading">
          <div className="editorial-ingestion-heading">
            <ShieldCheck size={17} />
            <div>
              <h2 id="staged-review-heading">Editorial Review</h2>
              <span>Review-only story details. Canon unchanged.</span>
            </div>
          </div>
          <div className="editorial-ingestion-safety">
            <span>Editorial review only</span>
            <span>Source material remains stored</span>
            <span>Canon unchanged</span>
          </div>
          <div className="editorial-state-legend" aria-label="Editorial state legend">
            <StateBadge state="staged-source" label="Source Material" />
            <StateBadge state="extracted-candidate" label="Review Item" />
            <StateBadge state="contradiction-risk" label="Continuity Concern" />
            <StateBadge state="duplicate-risk" label="Possible Duplicate" />
            <StateBadge state="accepted-placement" label="Ready to File" />
            <StateBadge state="promoted-canon" label="Promoted Canon" />
          </div>
          {lastStagedReview ? (
            <div className="review-workspace-guidance" role="status">
              <strong>Latest review item is ready</strong>
              <span>{lastStagedReview.title}</span>
              <small>Selected below in the Review Queue / Source material remains stored / Canon unchanged</small>
              <p>Next: review this item, then defer it, mark it reviewed, or mark it ready to file.</p>
            </div>
          ) : (
            <p className="review-workspace-guidance subtle">Review items from source material appear here. Select an item to inspect provenance, check continuity, or mark it ready for future filing.</p>
          )}
          <div className="editorial-triage-overview" aria-label="Editorial review overview for visible list">
            <ReviewFact label="Awaiting review" scope="in the list below" value={unresolvedCount} />
            <ReviewFact label="Continuity flags" scope="in the list below" value={contradictionCount} />
            <ReviewFact label="Possible duplicates" scope="in the list below" value={duplicateCount} />
            <ReviewFact label="Ready to file" scope="in the list below" value={acceptedCount} />
            <ReviewFact label="Canon safety" scope="with these review actions" value="Canon unchanged" />
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
                <option value="contradiction-risk">Continuity concern</option>
                <option value="duplicate-risk">Possible duplicate</option>
                <option value="accepted-for-placement">Ready to file</option>
              </select>
            </label>
            <label className="editorial-batch-note">
              <span>Batch note</span>
              <input onChange={(event) => setBatchNote(event.target.value)} placeholder="Optional editorial note" value={batchNote} />
            </label>
            <div className="editorial-batch-actions">
              <small>{selectedExtractionCount} selected</small>
              <button className="secondary-button editorial-ingestion-header-button quiet" disabled={!selectedExtractionCount || saving} onClick={() => applyBatchTriage('deferred')} type="button">Defer</button>
              <button className="secondary-button editorial-ingestion-header-button quiet" disabled={!selectedExtractionCount || saving} onClick={() => applyBatchTriage('resolved')} type="button">Mark Reviewed</button>
              <button className="secondary-button editorial-ingestion-header-button quiet" disabled={!selectedExtractionCount || saving} onClick={() => applyBatchTriage('accepted-for-placement')} type="button">Ready to File</button>
            </div>
          </div>

          <div className="editorial-review-split">
            <nav className="editorial-review-queue" aria-label="Review queue">
              <div className="editorial-review-queue-heading">
                <strong>Review Queue</strong>
                <small>Editorial review only / Canon unchanged</small>
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
                          <small>{cluster.meta} / Source material remains stored / {sourceUnresolved} awaiting review / {sourceAccepted} ready to file</small>
                        </button>
                        <button aria-label="Select source cluster" className="icon-button" onClick={() => toggleClusterSelection(cluster.items)} title="Select source cluster" type="button">
                          {allSelected ? <CheckSquare size={15} /> : <Square size={15} />}
                        </button>
                      </div>
                      {open ? cluster.items.map((item) => {
                        const isLatestStaged = lastStagedReview?.key === item.key;
                        return (
                        <div className={`editorial-triage-row ${isLatestStaged ? 'latest-staged-review' : ''}`} key={item.key}>
                          <button aria-label="Select review item" className="icon-button" onClick={() => toggleExtractionSelection(item.id)} title="Select review item" type="button">
                            {selectedExtractionSet.has(String(item.id)) ? <CheckSquare size={15} /> : <Square size={15} />}
                          </button>
                          <button
                            aria-current={selectedReviewKey === item.key ? 'true' : undefined}
                            className={`editorial-ingestion-item ${selectedReviewKey === item.key ? 'selected' : ''}`}
                            onClick={() => setSelectedReviewKey(item.key)}
                            type="button"
                          >
                            <span className="editorial-review-card-main">
                              <span className="editorial-review-card-badges">
                                <StateBadge state={getReviewStateKey(item)} label={getReviewStateLabel(item)} />
                                <StatusBadge status={formatReviewType(item.status)} />
                                {isLatestStaged ? <em className="latest-staged-label">Newly staged</em> : null}
                              </span>
                              <strong>{item.title}</strong>
                              <small>{item.sourceLabel || 'Source material remains stored'} / Canon unchanged / {formatDate(item.timestamp)}</small>
                              <span className="editorial-review-card-excerpt">{item.content || item.excerpt || item.meta}</span>
                            </span>
                          </button>
                          <button
                            aria-label={`Remove ${item.title} from Review Queue`}
                            className="quiet-danger-button review-queue-remove-button"
                            disabled={saving}
                            onClick={() => requestReviewRemoval(item)}
                            title="Remove from Review Queue"
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        );
                      }) : null}
                    </section>
                  );
                })}
                {!sourceClusters.length ? <p className="muted">No review items are visible for these filters yet. Add source material above first; once you add a story detail to the Review Queue, it appears here for editorial review.</p> : null}
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
                    <div className="editorial-review-detail-action-group">
                      {selectedReviewItem.kind === 'Review Item' ? (
                        <button className="secondary-button editorial-ingestion-header-button quiet" disabled={saving} onClick={() => requestReviewRemoval(selectedReviewItem)} type="button">
                          <Trash2 size={14} />
                          <span>Remove from Review Queue</span>
                        </button>
                      ) : null}
                      <button aria-label="Close review detail" className="icon-button" onClick={() => setSelectedReviewKey(null)} title="Close review detail" type="button">
                        <X size={16} />
                      </button>
                    </div>
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
                    <ReviewFact label="Review state" value={formatReviewType(selectedReviewItem.status)} />
                    <ReviewFact label="Confidence" value={formatConfidence(selectedReviewItem.confidence)} />
                    <ReviewFact label="Updated" value={formatDate(selectedReviewItem.timestamp)} />
                  </div>
                  <div className="editorial-review-meta-grid source-provenance-grid">
                    <ReviewFact label="Original file" value={selectedReviewItem.provenance?.original_filename || 'Manual source'} />
                    <ReviewFact label="Imported" value={selectedReviewItem.provenance?.imported_at_central || formatDate(selectedReviewItem.provenance?.imported_at)} />
                    <ReviewFact label="Layer" value={formatReviewType(selectedReviewItem.provenance?.memory_layer || 'source')} />
                    <ReviewFact label="Canon" value={selectedReviewItem.provenance?.canon_mutation ? 'Changed' : 'Canon unchanged'} />
                  </div>
                  {selectedReviewItem.kind === 'Review Item' ? (
                    <div className="review-layer-safety-note" aria-label="Review safety state">
                      <span>Source material remains stored</span>
                      <span>Accepted canon unchanged</span>
                      <span>Editorial review only</span>
                    </div>
                  ) : null}
                  {selectedReviewItem.conflict ? (
                    <ReviewBlock label="Continuity context" value={selectedReviewItem.conflict} />
                  ) : null}
                  {selectedReviewItem.status === 'accepted-for-placement' ? (
                    <ReviewBlock label="Filing readiness" value="Ready to file, still non-canon. Manual placement remains required before any canon record changes." />
                  ) : null}
                  {selectedReviewItem.status === 'contradiction-risk' ? (
                    <ReviewBlock label="Filing blocker" value="Continuity concern is surfaced for review only. Resolve the continuity question before future canon placement." />
                  ) : null}
                  {selectedReviewItem.status === 'duplicate-risk' ? (
                    <ReviewBlock label="Duplicate concern" value={selectedReviewItem.trustReason || selectedReviewItem.triageNote || 'Possible duplicate is surfaced for manual comparison before any future filing.'} />
                  ) : null}
                  {selectedReviewItem.kind === 'Review Item' ? (
                    <section className="selected-review-controls" aria-label="Selected review item status controls">
                      <div>
                        <label>
                          <span>Review status</span>
                          <select onChange={(event) => setSelectedReviewStatusDraft(event.target.value)} value={selectedReviewStatusDraft}>
                            {extractionReviewStates.map((state) => (
                              <option key={state.value} value={state.value}>{state.label}</option>
                            ))}
                          </select>
                        </label>
                        <label>
                          <span>Review note</span>
                          <input onChange={(event) => setSelectedReviewNote(event.target.value)} placeholder="Optional status note" value={selectedReviewNote} />
                        </label>
                      </div>
                      <div className="selected-review-actions">
                        <button className="secondary-button editorial-ingestion-header-button quiet" disabled={saving} onClick={() => applySelectedReviewTriage('deferred')} type="button">Defer</button>
                        <button className="secondary-button editorial-ingestion-header-button quiet" disabled={saving} onClick={() => applySelectedReviewTriage('resolved')} type="button">Mark Reviewed</button>
                        <button className="secondary-button editorial-ingestion-header-button quiet" disabled={saving} onClick={() => applySelectedReviewTriage('accepted-for-placement')} type="button">Ready to File</button>
                        <button className="primary-button editorial-ingestion-header-button" disabled={saving} onClick={() => applySelectedReviewTriage()} type="button">Save Status</button>
                      </div>
                      <small>These controls update editorial review state only. Accepted canon unchanged.</small>
                    </section>
                  ) : null}
                  <ReviewBlock label="Review material" value={selectedReviewItem.content || selectedReviewItem.meta} />
                  <ReviewBlock label="Raw source excerpt" value={selectedReviewItem.excerpt || selectedReviewItem.provenance?.source_note || 'No raw excerpt is attached to this review item.'} />
                  <ReviewBlock label="Editorial note" value={selectedReviewItem.triageNote || selectedReviewItem.trustReason || selectedReviewItem.provenance?.source_note || 'No editorial note recorded.'} />
                  <ReviewBlock label="Next editorial step" value={getNextEditorialStep(selectedReviewItem)} />
                </>
              ) : (
                <div className="editorial-review-empty">
                  <ShieldCheck size={20} />
                  <strong>Select a review item</strong>
                  <span>Choose a story detail in the Review Queue to see its source, provenance, excerpt, review state, duplicate or continuity concerns, and the next editorial step. Nothing here changes canon.</span>
                </div>
              )}
            </article>
          </div>
        </section>
      </div>
      {removeReviewTarget ? (
        <div className="modal-backdrop">
          <section aria-labelledby="review-remove-title" aria-modal="true" className="modal review-remove-modal" role="dialog">
            <div className="review-remove-modal-header">
              <div>
                <div className="eyebrow">Remove from Review Queue</div>
                <h2 id="review-remove-title">Remove this review item?</h2>
              </div>
              <button className="icon-button" disabled={saving} onClick={cancelReviewRemoval} title="Cancel removal" type="button">
                <X size={16} />
              </button>
            </div>
            <p>
              This only removes <strong>{removeReviewTarget.title}</strong> from editorial review. Source material remains stored. Accepted canon unchanged.
            </p>
            <div className="review-layer-safety-note" aria-label="Review removal safety state">
              <span>Source material remains stored</span>
              <span>Canon unchanged</span>
              <span>Editorial review only</span>
            </div>
            <div className="modal-actions">
              <button className="secondary-button" disabled={saving} onClick={cancelReviewRemoval} type="button">Cancel</button>
              <button className="secondary-button danger-button" disabled={saving} onClick={confirmReviewRemoval} type="button">
                <Trash2 size={14} />
                <span>{saving ? 'Removing...' : 'Remove from Review Queue'}</span>
              </button>
            </div>
          </section>
        </div>
      ) : null}
      {removeSourceTarget ? (
        <div className="modal-backdrop">
          <section aria-labelledby="source-remove-title" aria-modal="true" className="modal review-remove-modal" role="dialog">
            {(() => {
              const sourceIdentity = getSourceIdentity(removeSourceTarget);
              return (
                <>
            <div className="review-remove-modal-header">
              <div>
                <div className="eyebrow">Remove Stored Source Material</div>
                <h2 id="source-remove-title">Remove {sourceIdentity.primary}?</h2>
                <small className="source-remove-identity">{sourceIdentity.detail}</small>
              </div>
              <button className="icon-button" disabled={saving} onClick={cancelSourceRemoval} title="Cancel removal" type="button">
                <X size={16} />
              </button>
            </div>
            <p>
              This removes <strong>{sourceIdentity.primary}</strong> ({sourceIdentity.recordLabel}) from active Stored Source Material only. Linked story details stay in Editorial Review with their source history preserved, but they will no longer point to this stored source record. Source-only duplicate checks leave the Review Queue. Accepted canon is unchanged.
            </p>
            <div className="review-layer-safety-note" aria-label="Source removal safety state">
              <span>{formatLinkedReviewImpact(removeSourceImpact)}</span>
              <span>Canon unchanged</span>
              <span>{sourceIdentity.recordLabel}</span>
            </div>
            <div className="modal-actions">
              <button className="secondary-button" disabled={saving} onClick={cancelSourceRemoval} type="button">Keep Source</button>
              <button className="secondary-button danger-button" disabled={saving} onClick={confirmSourceRemoval} type="button">
                <Trash2 size={14} />
                <span>{saving ? 'Removing...' : 'Remove Source Material'}</span>
              </button>
            </div>
                </>
              );
            })()}
          </section>
        </div>
      ) : null}
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

const intakeSteps = [
  { key: 'source-batch', label: 'Source Batch' },
  { key: 'source-material', label: 'Source Material' },
  { key: 'story-detail', label: 'Story Detail' }
];

const confidencePresets = [
  { value: 'confirmed', label: 'Confirmed', definition: 'Directly supported by source material or prior canon.' },
  { value: 'strong', label: 'Strong', definition: 'Well supported, but still waiting for final editorial placement.' },
  { value: 'moderate', label: 'Moderate', definition: 'Plausible and useful, with context still worth checking.' },
  { value: 'weak', label: 'Weak', definition: 'Thinly supported or needs a continuity pass before use.' },
  { value: 'speculative', label: 'Speculative', definition: 'Idea-level material preserved without canon authority.' }
];

const extractionReviewStates = [
  { value: 'unreviewed', label: 'Awaiting Review' },
  { value: 'needs-review', label: 'Needs Review' },
  { value: 'contradiction-risk', label: 'Continuity Concern' },
  { value: 'duplicate-risk', label: 'Possible Duplicate' },
  { value: 'accepted-for-placement', label: 'Ready to File' },
  { value: 'deferred', label: 'Deferred' },
  { value: 'resolved', label: 'Reviewed' }
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
  const editorialLabels = {
    'accepted-for-placement': 'Ready to File',
    'pending-placement': 'Ready to File',
    'contradiction-risk': 'Continuity Concern',
    'duplicate-risk': 'Possible Duplicate',
    'needs-review': 'Needs Review',
    unreviewed: 'Awaiting Review',
    resolved: 'Reviewed'
  };
  const normalized = String(value || 'review').trim().toLowerCase().replace(/[_\s/]+/g, '-');
  if (editorialLabels[normalized]) return editorialLabels[normalized];
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
    !draft.title?.trim() ? 'a batch title' : '',
    !draft.provenanceNote?.trim() ? 'a provenance note' : ''
  ].filter(Boolean);
}

function getMissingSourceFields(draft, provenanceNote) {
  return [
    !draft.importSessionId ? 'a source batch' : '',
    !draft.rawContent?.trim() ? 'a source file' : '',
    !draft.sourceLabel?.trim() ? 'a source label' : '',
    !provenanceNote ? 'a provenance note' : ''
  ].filter(Boolean);
}

function getMissingCandidateFields(draft) {
  return [
    !draft.importSessionId ? 'a source batch' : '',
    !draft.sourceRecordId ? 'source material' : '',
    !draft.provenanceNote?.trim() ? 'a source provenance note' : '',
    !draft.rawContent?.trim() ? 'a raw source excerpt' : '',
    !draft.title?.trim() ? 'a story detail title' : '',
    !draft.content?.trim() ? 'a story note' : '',
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
  if (item.kind === 'Source Material') return 'staged-source';
  if (item.status === 'accepted-for-placement' || item.status === 'pending-placement') return 'accepted-placement';
  if (item.status === 'contradiction-risk') return 'contradiction-risk';
  if (item.status === 'duplicate-risk') return 'duplicate-risk';
  if (item.kind === 'Review Item' || item.kind === 'Narrative Fragment') return 'extracted-candidate';
  return 'extracted-candidate';
}

function getReviewStateLabel(item = {}) {
  if (item.kind === 'Source Material') return 'Source Material';
  if (item.status === 'accepted-for-placement' || item.status === 'pending-placement') return 'Ready to File';
  if (item.status === 'contradiction-risk') return 'Continuity Concern';
  if (item.status === 'duplicate-risk') return 'Possible Duplicate';
  if (item.provenance?.promotions?.length || item.status === 'Promoted') return 'Promoted Canon';
  return item.kind === 'Narrative Fragment' ? 'Story Note' : 'Review Item';
}

function getNextEditorialStep(item = {}) {
  if (item.kind === 'Source Material') {
    return 'This source is waiting for an editor to extract story details into the Review Queue. Keep it review-only; canon stays unchanged.';
  }
  if (item.status === 'accepted-for-placement' || item.status === 'pending-placement') {
    return 'This detail is waiting for manual placement. Use it as ready-to-file material only when the canon placement workflow exists; it is still non-canon now.';
  }
  if (item.status === 'contradiction-risk') {
    return 'This detail is waiting on continuity review. Compare the claims and resolve the concern before marking it reviewed or ready to file; canon stays unchanged.';
  }
  if (item.status === 'duplicate-risk') {
    return 'This detail is waiting for duplicate comparison. Check it against existing material before marking it reviewed or ready to file; do not merge automatically.';
  }
  if (item.status === 'resolved') {
    return 'This item has been reviewed and preserved in the editorial layer. No next canon action is implied, and canon remains unchanged.';
  }
  if (item.status === 'deferred') {
    return 'This item is waiting for later editorial judgment. Leave it deferred and out of canon until an editor deliberately reopens it.';
  }
  return 'This detail is waiting for editorial review. Read the source and trust note, then defer it, mark it reviewed, or mark it ready to file; none of those actions promotes canon.';
}

function getSourceRemovalImpact(source = {}, summary = {}) {
  const sourceId = String(source.id || '');
  const linkedReviewItems = [
    ...(summary.unresolvedExtractions || []),
    ...(summary.narrativeFragments || [])
  ].filter((item) => String(item.source_record_id || item.provenance_metadata?.source_record_id || '') === sourceId).length;
  const linkedDuplicateReviews = (summary.duplicateReviews || []).filter((item) => {
    const sourceRecordIds = Array.isArray(item.provenance_metadata?.source_record_ids) ? item.provenance_metadata.source_record_ids.map(String) : [];
    return sourceRecordIds.includes(sourceId)
      || (item.left_type === 'source_memory_record' && String(item.left_id) === sourceId)
      || (item.right_type === 'source_memory_record' && String(item.right_id) === sourceId);
  }).length;

  return { linkedReviewItems, linkedDuplicateReviews };
}

function getSourceIdentity(source = {}) {
  const provenance = source.provenance_metadata || {};
  const label = String(source.source_label || provenance.source_label || '').trim();
  const filename = String(provenance.original_filename || '').trim();
  const recordLabel = source.id ? `Source record #${source.id}` : 'Source record';
  const primary = label || filename || recordLabel;
  const detailParts = [
    filename && filename !== primary ? `File: ${filename}` : '',
    recordLabel,
    source.session_title ? `Batch: ${source.session_title}` : ''
  ].filter(Boolean);

  return {
    primary,
    filename,
    recordLabel,
    detail: detailParts.join(' / ') || recordLabel
  };
}

function isActiveSourceMaterial(source = {}) {
  const provenance = source.provenance_metadata || {};
  return provenance.source_material_removed !== true
    && provenance.source_record_removed_from_review_layer !== true
    && provenance.source_material_active !== false
    && provenance.active !== false;
}

function filterStoredSources(sources = [], query = '') {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return sources;

  return sources.filter((source) => {
    const provenance = source.provenance_metadata || {};
    return [
      source.source_label,
      source.source_type,
      source.session_title,
      source.id ? `source record ${source.id}` : '',
      provenance.source_label,
      provenance.source_note,
      provenance.original_filename,
      provenance.custom_source_label,
      provenance.file_preview_state
    ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
  });
}

function sortStoredSources(sources = [], sortOrder = 'newest') {
  return [...sources].sort((a, b) => {
    if (sortOrder === 'oldest') {
      return new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
    }
    if (sortOrder === 'title') {
      return getSourceIdentity(a).primary.localeCompare(getSourceIdentity(b).primary, undefined, { sensitivity: 'base' });
    }
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });
}

function buildIndexedSourceBatches(sessions = [], sources = []) {
  const batchMap = new Map(sessions.map((session) => [String(session.id), { ...session }]));

  for (const source of sources) {
    const batchId = String(source.import_session_id || source.provenance_metadata?.import_session_id || '');
    if (!batchId || batchMap.has(batchId)) continue;
    const provenance = source.provenance_metadata || {};
    batchMap.set(batchId, {
      id: batchId,
      title: source.session_title || provenance.session_title || `Source batch #${batchId}`,
      source_type: provenance.session_source_type || source.source_type,
      status: provenance.session_status || provenance.status || 'stored',
      notes: provenance.session_note || provenance.source_note || '',
      source_count: sources.filter((item) => String(item.import_session_id || item.provenance_metadata?.import_session_id || '') === batchId).length,
      created_at: source.created_at,
      provenance_metadata: {
        ...provenance,
        source_label: provenance.source_label || source.source_label,
        source_type: provenance.source_type || source.source_type,
        original_filename: provenance.original_filename,
        indexed_from_stored_source: true
      }
    });
  }

  return [...batchMap.values()].sort((a, b) => new Date(b.updated_at || b.created_at || 0).getTime() - new Date(a.updated_at || a.created_at || 0).getTime());
}

function filterSourceBatches(sessions = [], query = '') {
  const normalizedQuery = String(query || '').trim().toLowerCase();
  if (!normalizedQuery) return sessions;

  return sessions.filter((session) => {
    const provenance = session.provenance_metadata || {};
    return [
      session.label,
      session.name,
      session.title,
      session.type,
      session.source_type,
      formatSourceType(session.source_type, provenance.custom_source_label),
      session.source,
      session.provenance,
      session.mode,
      session.status,
      session.notes,
      session.id ? `source batch ${session.id}` : '',
      provenance.label,
      provenance.name,
      provenance.title,
      provenance.type,
      provenance.source,
      provenance.provenance,
      provenance.mode,
      provenance.status,
      provenance.source_note,
      provenance.source_label,
      provenance.source_type,
      provenance.custom_source_label,
      provenance.original_filename,
      ...collectSearchableValues(provenance)
    ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
  });
}

function collectSearchableValues(value, seen = new Set()) {
  if (value == null) return [];
  if (['string', 'number', 'boolean'].includes(typeof value)) return [value];
  if (typeof value !== 'object' || seen.has(value)) return [];
  seen.add(value);
  if (Array.isArray(value)) return value.flatMap((item) => collectSearchableValues(item, seen));
  return Object.values(value).flatMap((item) => collectSearchableValues(item, seen));
}

function formatLinkedReviewImpact(impact = {}) {
  const linkedReviewItems = Number(impact.linkedReviewItems || 0);
  const linkedDuplicateReviews = Number(impact.linkedDuplicateReviews || 0);
  if (!linkedReviewItems && !linkedDuplicateReviews) return 'No linked review items';
  if (!linkedDuplicateReviews) return `${linkedReviewItems} story detail${linkedReviewItems === 1 ? '' : 's'} unlinked`;
  if (!linkedReviewItems) return `${linkedDuplicateReviews} duplicate check${linkedDuplicateReviews === 1 ? '' : 's'} removed`;
  return `${linkedReviewItems} story detail${linkedReviewItems === 1 ? '' : 's'} unlinked / ${linkedDuplicateReviews} duplicate check${linkedDuplicateReviews === 1 ? '' : 's'} removed`;
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

function formatSourceOption(source) {
  return [
    source.source_label || 'Untitled source',
    source.session_title || `Batch #${source.import_session_id || source.provenance_metadata?.import_session_id || 'unknown'}`,
    `Source #${source.id}`,
    formatSourceType(source.source_type, source.provenance_metadata?.custom_source_label)
  ].filter(Boolean).join(' / ');
}

function buildAutoSessionTitle(filename) {
  const cleanName = String(filename || '').trim();
  if (cleanName) return `Source batch: ${cleanName}`;
  return `Source batch: ${new Date().toLocaleString()}`;
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
    `[Source material placeholder]`,
    `Original filename: ${file?.name || 'Unknown file'}`,
    `Source type: ${extension || 'unknown'}`,
    `Size: ${formatBytes(file?.size || 0)}`,
    `Preview: unavailable in this safe review pass.`
  ].join('\n');
}

function formatBytes(bytes) {
  const size = Number(bytes || 0);
  if (!size) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
