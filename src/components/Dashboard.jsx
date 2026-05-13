import { ArrowRight, BookOpen, FileSearch, FileText, History, MapPin, MessageSquareText, Sparkles, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';
import StatusBadge from './StatusBadge.jsx';

const acceptedStatus = 'Accepted / Needs Placement';
const openQuestionStatuses = new Set(['open', 'tentatively answered']);
const unresolvedDecisionStatuses = new Set(['proposed', 'accepted']);
const continuityRiskTags = ['contradiction-risk', 'canon-risk', 'timeline', 'continuity'];

export default function Dashboard() {
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const candidates = useRevivalStore((state) => state.candidates);
  const decisions = useRevivalStore((state) => state.decisions);
  const questions = useRevivalStore((state) => state.questions);
  const aiSessions = useRevivalStore((state) => state.aiSessions);
  const timelineEvents = useRevivalStore((state) => state.timelineEvents);
  const ingestionReviewSummary = useRevivalStore((state) => state.ingestionReviewSummary);
  const activeCandidateId = useRevivalStore((state) => state.activeCandidateId);
  const activeDecisionId = useRevivalStore((state) => state.activeDecisionId);
  const activeQuestionId = useRevivalStore((state) => state.activeQuestionId);
  const activeAiSessionId = useRevivalStore((state) => state.activeAiSessionId);
  const selectCandidate = useRevivalStore((state) => state.selectCandidate);
  const selectDecision = useRevivalStore((state) => state.selectDecision);
  const selectQuestion = useRevivalStore((state) => state.selectQuestion);
  const selectAiSession = useRevivalStore((state) => state.selectAiSession);
  const setActiveView = useRevivalStore((state) => state.setActiveView);
  const openIngestionReview = useRevivalStore((state) => state.openIngestionReview);
  const editorialCandidates = useMemo(() => candidates.filter((candidate) => !isInternalPhaseRecord(candidate, candidate.title)), [candidates]);
  const editorialDecisions = useMemo(() => decisions.filter((decision) => !isInternalPhaseRecord(decision, decision.title)), [decisions]);
  const editorialQuestions = useMemo(() => questions.filter((question) => !isInternalPhaseRecord(question, question.question)), [questions]);
  const editorialAiSessions = useMemo(() => aiSessions.filter((session) => !isInternalPhaseRecord(session, getSessionTitle(session))), [aiSessions]);

  const unresolvedQuestions = useMemo(
    () => editorialQuestions
      .filter((question) => openQuestionStatuses.has(normalize(question.status)))
      .sort(compareRecent)
      .slice(0, 5),
    [editorialQuestions]
  );
  const awaitingPlacement = useMemo(
    () => editorialCandidates
      .filter((candidate) => normalizeCandidateStatus(candidate.status) === acceptedStatus || ['new', 'in review'].includes(normalize(candidate.status)))
      .sort(compareRecent)
      .slice(0, 5),
    [editorialCandidates]
  );
  const recentDecisions = useMemo(
    () => [...editorialDecisions].sort(compareRecent).slice(0, 4),
    [editorialDecisions]
  );
  const continuityRisks = useMemo(
    () => buildContinuityRisks({ candidates: editorialCandidates, questions: editorialQuestions, decisions: editorialDecisions, timelineEvents, ingestionReviewSummary }).slice(0, 4),
    [editorialCandidates, editorialDecisions, editorialQuestions, ingestionReviewSummary, timelineEvents]
  );
  const ingestionReviewItems = useMemo(
    () => buildIngestionReviewItems(ingestionReviewSummary).slice(0, 6),
    [ingestionReviewSummary]
  );
  const extractionReviewStats = useMemo(
    () => buildExtractionReviewStats(ingestionReviewSummary),
    [ingestionReviewSummary]
  );
  const weakConfidenceItems = useMemo(
    () => buildWeakConfidenceItems(ingestionReviewSummary).slice(0, 4),
    [ingestionReviewSummary]
  );
  const routedReviewItems = useMemo(
    () => [...ingestionReviewItems, ...weakConfidenceItems, ...continuityRisks.map((risk) => risk.reviewItem).filter(Boolean)],
    [continuityRisks, ingestionReviewItems, weakConfidenceItems]
  );
  const activeReviewDetail = useMemo(
    () => routedReviewItems.find((item) => item.key === selectedReviewItem?.key) || routedReviewItems[0] || null,
    [routedReviewItems, selectedReviewItem]
  );
  const recentActivity = useMemo(
    () => [
      ...editorialCandidates.map((candidate) => toActivity('Candidate', candidate, candidate.title, candidate.status, () => selectCandidate(candidate.id))),
      ...editorialQuestions.map((question) => toActivity('Question', question, question.question, question.status, () => selectQuestion(question.id))),
      ...editorialDecisions.map((decision) => toActivity('Decision', decision, decision.title, decision.status, () => selectDecision(decision.id))),
      ...editorialAiSessions.map((session) => toActivity('AI Session', session, getSessionTitle(session), session.provider, () => selectAiSession(session.id)))
    ].sort(compareActivityRecent).slice(0, 6),
    [editorialAiSessions, editorialCandidates, editorialDecisions, editorialQuestions, selectAiSession, selectCandidate, selectDecision, selectQuestion]
  );
  const continueItems = useMemo(
    () => buildContinueItems({
      activeCandidate: editorialCandidates.find((candidate) => String(candidate.id) === String(activeCandidateId)),
      activeDecision: editorialDecisions.find((decision) => String(decision.id) === String(activeDecisionId)),
      activeQuestion: editorialQuestions.find((question) => String(question.id) === String(activeQuestionId)),
      activeSession: editorialAiSessions.find((session) => String(session.id) === String(activeAiSessionId)),
      awaitingPlacement,
      unresolvedQuestions,
      recentDecisions,
      selectCandidate,
      selectDecision,
      selectQuestion,
      selectAiSession
    }),
    [activeAiSessionId, activeCandidateId, activeDecisionId, activeQuestionId, awaitingPlacement, editorialAiSessions, editorialCandidates, editorialDecisions, editorialQuestions, recentDecisions, selectAiSession, selectCandidate, selectDecision, selectQuestion, unresolvedQuestions]
  );

  return (
    <section className="view dashboard-home">
      <header className="dashboard-header">
        <div>
          <div className="eyebrow">Editorial Home</div>
          <h1>Continue the story work</h1>
          <p className="dashboard-lede">
            A quiet recall space for open editorial threads, recent changes, and narrative continuity work.
            Nothing here promotes or changes canon without an explicit user action.
          </p>
        </div>
        <button className="secondary-button dashboard-heading-action" onClick={() => setActiveView('session')} type="button">
          <Sparkles size={15} />
          <span>AI Sessions</span>
        </button>
      </header>

      <div className="dashboard-workspace">
        <div className="dashboard-primary-column">
          <section className="dashboard-focus" aria-labelledby="continue-working-heading">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-kicker">Continue Working</span>
                <h2 id="continue-working-heading">Pick up where the memory is warm</h2>
              </div>
            </div>
            <div className="dashboard-continue-list">
              {continueItems.map((item) => (
                <button className="dashboard-continue-card" key={item.key} onClick={item.onOpen} type="button">
                  <span className="dashboard-card-icon">{item.icon}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
            </div>
          </section>

          <section className="dashboard-panel dashboard-activity" aria-labelledby="recent-activity-heading">
            <div className="dashboard-panel-title">
              <History size={17} />
              <h2 id="recent-activity-heading">Recent Editorial Activity</h2>
            </div>
            <div className="dashboard-activity-list">
              {recentActivity.map((activity) => (
                <button className="dashboard-row" key={activity.key} onClick={activity.onOpen} type="button">
                  <span>
                    <strong>{activity.title}</strong>
                    <small>{activity.type} / {activity.meta || 'Editorial record'} / {formatDate(activity.timestamp)}</small>
                  </span>
                  <ArrowRight size={15} />
                </button>
              ))}
              {!recentActivity.length ? <p className="muted">No recent editorial activity is currently loaded.</p> : null}
            </div>
          </section>
        </div>

        <aside className="dashboard-panel dashboard-editorial-focus" aria-labelledby="editorial-focus-heading">
          <div className="dashboard-panel-title">
            <FileSearch size={17} />
            <h2 id="editorial-focus-heading">Editorial Focus</h2>
          </div>
          <div className="dashboard-focus-queues">
            <DashboardQueue
              emptyText="No continuity review items are currently surfaced."
              icon={<TriangleAlert size={15} />}
              items={continuityRisks.map((risk) => ({
                key: risk.key,
                title: risk.title,
                meta: risk.meta,
                status: risk.status,
                onOpen: risk.reviewItem ? () => openIngestionReview(risk.reviewItem.key) : risk.onOpen || (() => setActiveView(risk.fallbackView))
              }))}
              title="Continuity Review"
            />
            <DashboardQueue
              emptyText="No source-memory review items are currently waiting."
              icon={<FileSearch size={15} />}
              items={ingestionReviewItems.map((item) => ({
                key: item.key,
                title: item.title,
                meta: item.meta,
                status: item.status,
                onOpen: () => openIngestionReview(item.key)
              }))}
              title="Source Review"
            />
            <DashboardQueue
              emptyText="No review items are marked ready to file."
              icon={<MapPin size={15} />}
              items={extractionReviewStats.acceptedItems.map((item) => ({
                key: item.key,
                title: item.title,
                meta: item.meta,
                status: item.status,
                onOpen: () => openIngestionReview(item.key)
              }))}
              title="Ready to File"
            />
            <DashboardQueue
              emptyText="No deferred review items are currently surfaced."
              icon={<History size={15} />}
              items={extractionReviewStats.deferredItems.map((item) => ({
                key: item.key,
                title: item.title,
                meta: item.meta,
                status: item.status,
                onOpen: () => openIngestionReview(item.key)
              }))}
              title="Deferred Review"
            />
            <DashboardQueue
              emptyText="No source review progress is currently loaded."
              icon={<FileText size={15} />}
              items={extractionReviewStats.sourceProgress.map((item) => ({
                key: item.key,
                title: item.title,
                meta: item.meta,
                status: item.status,
                onOpen: () => openIngestionReview(item.reviewKey)
              }))}
              title="Source Progress"
            />
            <DashboardQueue
              emptyText="No weak-confidence material is currently waiting."
              icon={<Sparkles size={15} />}
              items={weakConfidenceItems.map((item) => ({
                key: item.key,
                title: item.title,
                meta: item.meta,
                status: item.status,
                onOpen: () => openIngestionReview(item.key)
              }))}
              title="Confidence Check"
            />
            <DashboardQueue
              emptyText="No pending filing work is currently loaded."
              icon={<MapPin size={15} />}
              items={awaitingPlacement.map((candidate) => ({
                key: `candidate-${candidate.id}`,
                title: candidate.title,
                meta: `${normalizeCandidateStatus(candidate.status)} / Updated ${formatDate(candidate.updated_at || candidate.created_at)}`,
                status: getCandidateSource(candidate),
                onOpen: () => selectCandidate(candidate.id)
              }))}
              title="Ready to Place"
            />
            <DashboardQueue
              emptyText="No unresolved questions are currently loaded."
              icon={<MessageSquareText size={15} />}
              items={unresolvedQuestions.map((question) => ({
                key: `question-${question.id}`,
                title: question.question,
                meta: `${question.status || 'Open'} / Updated ${formatDate(question.updated_at)}`,
                status: question.urgency,
                onOpen: () => selectQuestion(question.id)
              }))}
              title="Open Questions"
            />
            <DashboardQueue
              emptyText="No recent decisions are currently loaded."
              icon={<BookOpen size={15} />}
              items={recentDecisions.map((decision) => ({
                key: `decision-${decision.id}`,
                title: decision.title,
                meta: `${decision.status || 'Proposed'} / Updated ${formatDate(decision.updated_at)}`,
                status: decision.final_decision || decision.answer ? 'Decision text present' : 'Final decision pending',
                onOpen: () => selectDecision(decision.id)
              }))}
              title="Recent Decisions"
            />
          </div>
          <ReviewDetail item={activeReviewDetail} />
        </aside>
      </div>
    </section>
  );
}

function DashboardQueue({ emptyText, icon, items, title }) {
  return (
    <section className="dashboard-queue">
      <div className="dashboard-queue-title">
        <span>
          {icon}
          <strong>{title}</strong>
        </span>
        <small>{items.length}</small>
      </div>
      <div className="dashboard-panel-list">
        {items.map((item) => (
          <button className="dashboard-row" key={item.key} onClick={item.onOpen} type="button">
            <span>
              <strong>{item.title}</strong>
              <small>{item.meta}</small>
            </span>
            {item.status ? <StatusBadge status={item.status} /> : <ArrowRight size={15} />}
          </button>
        ))}
        {!items.length ? <p className="muted">{emptyText}</p> : null}
      </div>
    </section>
  );
}

function ReviewDetail({ item }) {
  if (!item) {
    return (
      <section className="dashboard-review-detail" aria-label="Review detail">
        <div>
          <strong>Review Detail</strong>
          <small>No editorial review item is selected.</small>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-review-detail" aria-label="Review detail">
      <div className="dashboard-review-detail-heading">
        <div>
          <span>{item.kindLabel}</span>
          <strong>{item.rawTitle || item.title}</strong>
        </div>
        {item.status ? <StatusBadge status={item.status} /> : null}
      </div>
      <div className="dashboard-review-detail-body">
        {item.detailRows.map((row) => (
          <p key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </p>
        ))}
      </div>
      <small>{item.provenanceSummary}</small>
    </section>
  );
}

function buildContinueItems({
  activeCandidate,
  activeDecision,
  activeQuestion,
  activeSession,
  awaitingPlacement,
  unresolvedQuestions,
  recentDecisions,
  selectCandidate,
  selectDecision,
  selectQuestion,
  selectAiSession
}) {
  const items = [];

  if (activeCandidate) {
    items.push({
      key: `candidate-${activeCandidate.id}`,
      title: activeCandidate.title,
      meta: `Candidate / ${normalizeCandidateStatus(activeCandidate.status)} / Updated ${formatDate(activeCandidate.updated_at || activeCandidate.created_at)}`,
      icon: <MapPin size={17} />,
      onOpen: () => selectCandidate(activeCandidate.id)
    });
  }

  if (activeQuestion) {
    items.push({
      key: `question-${activeQuestion.id}`,
      title: activeQuestion.question,
      meta: `Question / ${activeQuestion.status || 'Open'} / Updated ${formatDate(activeQuestion.updated_at)}`,
      icon: <MessageSquareText size={17} />,
      onOpen: () => selectQuestion(activeQuestion.id)
    });
  }

  if (activeDecision) {
    items.push({
      key: `decision-${activeDecision.id}`,
      title: activeDecision.title,
      meta: `Decision / ${activeDecision.status || 'Proposed'} / Updated ${formatDate(activeDecision.updated_at)}`,
      icon: <BookOpen size={17} />,
      onOpen: () => selectDecision(activeDecision.id)
    });
  }

  if (activeSession) {
    items.push({
      key: `session-${activeSession.id}`,
      title: getSessionTitle(activeSession),
      meta: `AI Session / ${activeSession.provider || 'provider unset'} / Updated ${formatDate(activeSession.updated_at || activeSession.created_at)}`,
      icon: <Sparkles size={17} />,
      onOpen: () => selectAiSession(activeSession.id)
    });
  }

  const fallbacks = [
    ...awaitingPlacement.map((candidate) => ({
      key: `candidate-${candidate.id}`,
      title: candidate.title,
      meta: `Candidate / ${normalizeCandidateStatus(candidate.status)} / Updated ${formatDate(candidate.updated_at || candidate.created_at)}`,
      icon: <MapPin size={17} />,
      onOpen: () => selectCandidate(candidate.id)
    })),
    ...unresolvedQuestions.map((question) => ({
      key: `question-${question.id}`,
      title: question.question,
      meta: `Question / ${question.status || 'Open'} / Updated ${formatDate(question.updated_at)}`,
      icon: <MessageSquareText size={17} />,
      onOpen: () => selectQuestion(question.id)
    })),
    ...recentDecisions.map((decision) => ({
      key: `decision-${decision.id}`,
      title: decision.title,
      meta: `Decision / ${decision.status || 'Proposed'} / Updated ${formatDate(decision.updated_at)}`,
      icon: <BookOpen size={17} />,
      onOpen: () => selectDecision(decision.id)
    }))
  ];

  return dedupeByKey([...items, ...fallbacks]).slice(0, 4);
}

function buildContinuityRisks({ candidates, questions, decisions, timelineEvents, ingestionReviewSummary }) {
  const candidateRisks = candidates
    .filter((candidate) => getCandidateTags(candidate).some((tag) => continuityRiskTags.some((risk) => tag.includes(risk))))
    .sort(compareRecent)
    .map((candidate) => ({
      key: `risk-candidate-${candidate.id}`,
      title: candidate.title,
      meta: `Candidate tag review / Updated ${formatDate(candidate.updated_at || candidate.created_at)}`,
      status: getCandidateTags(candidate).find((tag) => continuityRiskTags.some((risk) => tag.includes(risk))) || 'Continuity',
      onOpen: () => useRevivalStore.getState().selectCandidate(candidate.id)
    }));

  const blockedQuestions = questions
    .filter((question) => question.blocked_by || question.blocks)
    .sort(compareRecent)
    .map((question) => ({
      key: `risk-question-${question.id}`,
      title: question.question,
      meta: `Dependency review / Updated ${formatDate(question.updated_at)}`,
      status: question.status || 'Open',
      onOpen: () => useRevivalStore.getState().selectQuestion(question.id)
    }));

  const blockedDecisions = decisions
    .filter((decision) => unresolvedDecisionStatuses.has(normalize(decision.status)) && (decision.blocked_by || decision.blocks))
    .sort(compareRecent)
    .map((decision) => ({
      key: `risk-decision-${decision.id}`,
      title: decision.title,
      meta: `Decision dependency / Updated ${formatDate(decision.updated_at)}`,
      status: decision.status || 'Proposed',
      onOpen: () => useRevivalStore.getState().selectDecision(decision.id)
    }));

  const timelineGaps = timelineEvents
    .filter((event) => normalize(event.status).includes('tentative') || normalize(event.status).includes('review'))
    .sort(compareRecent)
    .map((event) => ({
      key: `risk-timeline-${event.id}`,
      title: event.title || event.event || 'Timeline item',
      meta: `Timeline review / Updated ${formatDate(event.updated_at || event.created_at)}`,
      status: event.status || 'Timeline',
      onOpen: () => useRevivalStore.getState().selectTimelineEvent(event.id)
    }));

  const routedReviews = (ingestionReviewSummary?.continuityReviews || [])
    .map((item) => ({
      key: `risk-continuity-review-${item.id}`,
      title: item.title,
      meta: `${formatReviewType(item.review_type)} / Updated ${formatDate(item.updated_at || item.created_at)}`,
      status: item.confidence_state || item.risk_level || 'Review',
      reviewItem: toContinuityReviewItem(item),
      fallbackView: 'dashboard'
    }));

  return [...routedReviews, ...candidateRisks, ...blockedQuestions, ...blockedDecisions, ...timelineGaps];
}

function buildIngestionReviewItems(summary = {}) {
  const duplicates = (summary.duplicateReviews || []).map((item) => ({
    key: `duplicate-${item.id}`,
    kindLabel: 'Duplicate Review',
    rawTitle: 'Possible duplicate',
    title: `Duplicate review: ${formatReviewEndpoint(item.left_type, item.left_id)} / ${formatReviewEndpoint(item.right_type, item.right_id)}`,
    meta: `${item.reason || 'Manual duplicate review'} / Updated ${formatDate(item.updated_at || item.created_at)}`,
    status: item.confidence || item.status,
    timestamp: item.updated_at || item.created_at,
    provenanceSummary: formatFrameworkProvenance(item.provenance_metadata),
    detailRows: [
      { label: 'Left', value: formatReviewEndpoint(item.left_type, item.left_id) },
      { label: 'Right', value: formatReviewEndpoint(item.right_type, item.right_id) },
      { label: 'Reason', value: item.reason || 'Manual duplicate review' }
    ]
  }));
  const extractions = (summary.unresolvedExtractions || []).map((item) => ({
    key: `extraction-${item.id}`,
    kindLabel: 'Review Item',
    rawTitle: item.title,
    title: `${formatReviewType(normalizeExtractionTriageState(item.status))}: ${item.title}`,
    meta: `${formatReviewType(item.classification)} / ${item.source_label || 'Source preserved'} / Updated ${formatDate(item.updated_at || item.created_at)}`,
    status: formatReviewType(normalizeExtractionTriageState(item.status)),
    timestamp: item.updated_at || item.created_at,
    priorityState: normalizeExtractionTriageState(item.status),
    provenanceSummary: formatFrameworkProvenance(item.provenance_metadata),
    detailRows: [
      { label: 'Source', value: item.source_label || 'Source preserved' },
      { label: 'Review state', value: formatReviewType(normalizeExtractionTriageState(item.status)) },
      { label: 'Classification', value: formatReviewType(item.classification) },
      { label: 'Story note', value: item.content || 'No story note recorded.' },
      { label: 'Trust', value: item.trust_reason || 'Needs review' }
    ]
  }));
  const fragments = (summary.narrativeFragments || []).map((item) => ({
    key: `fragment-${item.id}`,
    kindLabel: 'Narrative Fragment',
    rawTitle: item.title,
    title: `Story note: ${item.title}`,
    meta: `${formatReviewType(item.fragment_type)} / ${item.source_label || 'Source preserved'} / Updated ${formatDate(item.updated_at || item.created_at)}`,
    status: item.confidence_state || item.status,
    timestamp: item.updated_at || item.created_at,
    provenanceSummary: formatFrameworkProvenance(item.provenance_metadata),
    detailRows: [
      { label: 'Source', value: item.source_label || 'Source preserved' },
      { label: 'Type', value: formatReviewType(item.fragment_type) },
      { label: 'Content', value: item.content || 'No fragment content.' },
      { label: 'Canon state', value: 'Not added to canon yet' }
    ]
  }));
  const continuity = (summary.continuityReviews || []).map(toContinuityReviewItem);

  return [...continuity, ...duplicates, ...extractions, ...fragments]
    .sort(compareReviewPriority);
}

function buildWeakConfidenceItems(summary = {}) {
  const weakStates = new Set(['low', 'weak', 'uncertain', 'unverified', 'needs-review']);
  return buildIngestionReviewItems(summary)
    .filter((item) => weakStates.has(normalize(item.status)) || normalize(item.status).includes('weak') || normalize(item.status).includes('low'))
    .map((item) => ({
      ...item,
      title: item.title.replace(/^(Review item|Story note|Continuity review): /i, '')
    }));
}

function buildExtractionReviewStats(summary = {}) {
  const reviewItems = buildIngestionReviewItems(summary).filter((item) => item.key.startsWith('extraction-'));
  const acceptedItems = reviewItems.filter((item) => item.priorityState === 'accepted-for-placement').slice(0, 4);
  const deferredItems = reviewItems.filter((item) => item.priorityState === 'deferred').slice(0, 4);
  const sourceRecords = summary.sourceRecords || [];
  const extractions = summary.unresolvedExtractions || [];
  const sourceProgress = sourceRecords
    .map((source) => {
      const sourceExtractions = extractions.filter((item) => String(item.source_record_id) === String(source.id));
      const unresolved = sourceExtractions.filter((item) => !['resolved', 'deferred'].includes(normalizeExtractionTriageState(item.status))).length;
      if (!sourceExtractions.length) return null;
      const firstExtraction = [...sourceExtractions].sort(compareReviewPriority)[0];
      return {
        key: `source-progress-${source.id}`,
        title: source.source_label,
        meta: `${sourceExtractions.length} review item${sourceExtractions.length === 1 ? '' : 's'} / ${unresolved} awaiting review`,
        status: unresolved ? 'Needs Review' : 'Reviewed',
        reviewKey: firstExtraction ? `extraction-${firstExtraction.id}` : null
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.status === 'Needs Review') - Number(a.status === 'Needs Review'))
    .slice(0, 4);

  return { acceptedItems, deferredItems, sourceProgress };
}

function toContinuityReviewItem(item) {
  return {
    key: `continuity-${item.id}`,
    kindLabel: 'Continuity Review',
    rawTitle: item.title,
    title: `Continuity review: ${item.title}`,
    meta: `${formatReviewType(item.review_type)} / Updated ${formatDate(item.updated_at || item.created_at)}`,
    status: item.confidence_state || item.risk_level,
    timestamp: item.updated_at || item.created_at,
    provenanceSummary: formatFrameworkProvenance(item.provenance_metadata),
    detailRows: [
      { label: 'Claim A', value: item.claim_a || 'No first claim recorded.' },
      { label: 'Claim B', value: item.claim_b || 'No second claim recorded.' },
      { label: 'Risk', value: item.risk_level || 'Review' }
    ]
  };
}

function toActivity(type, record, title, meta, onOpen) {
  return {
    key: `${type}-${record.id}`,
    type,
    title,
    meta,
    timestamp: record.updated_at || record.created_at,
    onOpen
  };
}

function compareRecent(a, b) {
  return getTime(b) - getTime(a);
}

function compareActivityRecent(a, b) {
  return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
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
  const aPriority = priority[a.priorityState || normalizeExtractionTriageState(a.status)] ?? 3;
  const bPriority = priority[b.priorityState || normalizeExtractionTriageState(b.status)] ?? 3;
  if (aPriority !== bPriority) return aPriority - bPriority;
  return new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime();
}

function getTime(record) {
  return new Date(record?.updated_at || record?.created_at || 0).getTime();
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

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCandidateStatus(status) {
  const normalized = normalize(status).replace(/[_-]+/g, ' ');
  if (normalized === 'accepted' || normalized === 'needs placement' || normalized === 'accepted needs placement') {
    return acceptedStatus;
  }
  if (normalized === 'in review') return 'In Review';
  if (normalized === 'promoted') return 'Promoted';
  if (normalized === 'rejected') return 'Rejected';
  return status || 'New';
}

function normalizeExtractionTriageState(value) {
  const normalized = normalize(value).replace(/[_\s/]+/g, '-');
  const aliases = {
    unresolved: 'unreviewed',
    'in-review': 'needs-review',
    'pending-placement': 'accepted-for-placement',
    accepted: 'accepted-for-placement',
    reviewed: 'resolved',
    rejected: 'deferred'
  };
  const canonical = aliases[normalized] || normalized || 'unreviewed';
  const allowed = new Set(['unreviewed', 'needs-review', 'contradiction-risk', 'duplicate-risk', 'accepted-for-placement', 'deferred', 'resolved']);
  return allowed.has(canonical) ? canonical : 'unreviewed';
}

function getCandidateTags(candidate) {
  const tags = candidate?.provenance_metadata?.tags;
  return Array.isArray(tags) ? tags.map((tag) => String(tag).toLowerCase()) : [];
}

function getCandidateSource(candidate) {
  const source = candidate?.provenance_metadata?.source || 'Manual';
  return `${source} source`;
}

function getSessionTitle(session) {
  return session.template_id || session.context_type || session.user_instructions?.slice(0, 48) || `Session ${session.id}`;
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

function formatReviewEndpoint(type, id) {
  return `${formatReviewType(type)} ${id}`;
}

function formatFrameworkProvenance(provenance = {}) {
  const sourceIds = Array.isArray(provenance.source_record_ids)
    ? provenance.source_record_ids.join(', ')
    : provenance.source_record_id || '';
  const session = provenance.import_session_id ? `Session ${provenance.import_session_id}` : 'Session linked by source memory when available';
  const source = sourceIds ? `Source ${sourceIds}` : 'Source metadata preserved';
  const preserved = provenance.preserved === false ? 'not marked preserved' : 'preserved';
  return `${session} / ${source} / ${preserved} / non-canon`;
}

function isInternalPhaseRecord(record, title) {
  const haystack = [
    title,
    record?.template_id,
    record?.user_instructions,
    record?.prompt
  ].filter(Boolean).join(' ');
  return /\bphase[-\s]*\d+[a-z]?\b/i.test(haystack);
}

function dedupeByKey(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.key)) return false;
    seen.add(item.key);
    return true;
  });
}
