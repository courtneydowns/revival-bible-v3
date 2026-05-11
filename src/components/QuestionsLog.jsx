import { useEffect, useMemo, useRef, useState } from 'react';
import { Info, Search, Trash2 } from 'lucide-react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import PromotionProvenance from './PromotionProvenance.jsx';
import ResolutionEditor from './ResolutionEditor.jsx';
import StatusBadge from './StatusBadge.jsx';
import TagEditor from './TagEditor.jsx';

const urgencyLabels = {
  pinned: 'Pinned',
  tier1: 'Tier 1 - Blocks Pilot',
  tier2: 'Tier 2 - Blocks Season Overview',
  tier3: "Tier 3 - Blocks Writers' Room"
};
const urgencyDescriptions = {
  all: 'All open editorial questions.',
  pinned: 'Keep in view regardless of urgency.',
  tier1: 'Blocks pilot-level choices.',
  tier2: 'Blocks season overview choices.',
  tier3: "Useful for writers' room refinement."
};

export default function QuestionsLog() {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [questionSearch, setQuestionSearch] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [showTierHelp, setShowTierHelp] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const appliedNavigationFocusTick = useRef(0);
  const questionCardRefs = useRef(new Map());
  const detailPanelRef = useRef(null);
  const activeQuestionId = useRevivalStore((state) => state.activeQuestionId);
  const questions = useRevivalStore((state) => state.questions);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const navigationFocusTick = useRevivalStore((state) => state.navigationFocusTick);
  const loadQuestions = useRevivalStore((state) => state.loadQuestions);
  const createQuestion = useRevivalStore((state) => state.createQuestion);
  const deleteQuestion = useRevivalStore((state) => state.deleteQuestion);
  const selectQuestion = useRevivalStore((state) => state.selectQuestion);
  const selectedQuestion = useMemo(
    () => questions.find((question) => String(question.id) === String(activeQuestionId)) || questions[0],
    [activeQuestionId, questions]
  );
  const groupedQuestions = useMemo(() => groupByUrgency(questions), [questions]);
  const visibleQuestions = useMemo(
    () => questions.filter((question) => {
      const query = questionSearch.trim().toLowerCase();
      const matchesUrgency = selectedUrgency === 'all' || question.urgency === selectedUrgency;
      const matchesSearch = !query || [
        question.question,
        question.context,
        question.status,
        question.urgency,
        question.blocked_by,
        question.blocks
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
      return matchesUrgency && matchesSearch;
    }),
    [questionSearch, questions, selectedUrgency]
  );

  useEffect(() => {
    if (!questions.length) {
      loadQuestions();
    }
  }, [loadQuestions, questions.length]);

  useEffect(() => {
    if (!activeQuestionId && questions.length) {
      selectQuestion(questions[0].id);
    }
  }, [activeQuestionId, questions, selectQuestion]);

  useEffect(() => {
    if (!activeQuestionId || !navigationFocusTick) return;
    if (appliedNavigationFocusTick.current === navigationFocusTick) return;

    appliedNavigationFocusTick.current = navigationFocusTick;
    const card = questionCardRefs.current.get(String(activeQuestionId));
    card?.scrollIntoView({ block: 'center', behavior: 'auto' });
    card?.focus({ preventScroll: true });

    if (detailPanelRef.current) {
      detailPanelRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [activeQuestionId, navigationFocusTick, questions.length]);

  const handleCreateQuestion = async (event) => {
    event.preventDefault();
    const question = newQuestionText.trim();
    if (!question || creating) return;

    setCreating(true);
    setCreateMessage('');
    try {
      const response = await createQuestion({ question, urgency: 'tier3' });
      if (response?.ok) {
        setNewQuestionText('');
        setCreateMessage('Question created.');
      } else {
        setCreateMessage(response?.message || 'Question was not created.');
      }
    } catch (error) {
      setCreateMessage(error?.message || 'Question was not created.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion || deleting) return;

    if (String(deleteConfirmId) !== String(selectedQuestion.id)) {
      setDeleteConfirmId(selectedQuestion.id);
      setDeleteMessage('Select delete again to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteMessage('');
    try {
      const response = await deleteQuestion(selectedQuestion.id);
      if (!response?.ok) {
        setDeleteMessage(response?.message || 'Question was not deleted.');
      } else {
        setDeleteConfirmId(null);
      }
    } catch (error) {
      setDeleteMessage(error?.message || 'Question was not deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Questions</div>
      <h1>Questions Log</h1>
      <p className="dashboard-lede">Open creative questions for canon review, answer drafting, and dependency tracking.</p>

      <div className="phase3b-workspace question-editorial-workspace">
        <aside className="phase3b-list-panel">
          <div className="editorial-list-tools question-list-tools">
            <label className="editorial-search-field">
              <Search size={15} />
              <input
                onChange={(event) => setQuestionSearch(event.target.value)}
                placeholder="Search questions"
                value={questionSearch}
              />
            </label>
            <select
              aria-label="Filter questions by tier"
              onChange={(event) => setSelectedUrgency(event.target.value)}
              value={selectedUrgency}
            >
              {['all', ...Object.keys(urgencyLabels)].map((urgency) => {
                const count = urgency === 'all' ? questions.length : groupedQuestions[urgency]?.length || 0;
                return (
                  <option key={urgency} value={urgency}>
                    {urgency === 'all' ? 'All tiers' : `${urgencyLabels[urgency]} (${count})`}
                  </option>
                );
              })}
            </select>
            <button
              aria-expanded={showTierHelp}
              className="icon-button tier-help-toggle"
              onClick={() => setShowTierHelp((value) => !value)}
              title="Tier guidance"
              type="button"
            >
              <Info size={15} />
            </button>
          </div>
          {showTierHelp ? (
            <div className="tier-help-panel">
              {Object.entries(urgencyDescriptions).map(([urgency, description]) => (
                <p key={urgency}><strong>{urgency === 'all' ? 'All' : urgencyLabels[urgency]}</strong> {description}</p>
              ))}
            </div>
          ) : null}
          <form className="record-create-row compact-create-row" onSubmit={handleCreateQuestion}>
            <input
              aria-label="New question text"
              disabled={creating}
              onChange={(event) => setNewQuestionText(event.target.value)}
              placeholder="New question"
              value={newQuestionText}
            />
            <button className="secondary-button" disabled={creating || !newQuestionText.trim()} type="submit">
              Add
            </button>
            {createMessage ? <p className="editor-message">{createMessage}</p> : null}
          </form>
          <section className="phase3b-group">
            <h2>{selectedUrgency === 'all' ? 'All Questions' : urgencyLabels[selectedUrgency]}</h2>
            {visibleQuestions.map((question) => (
                <button
                  className={`phase3b-card ${String(selectedQuestion?.id) === String(question.id) ? 'selected' : ''}`}
                  key={question.id}
                  onClick={() => selectQuestion(question.id)}
                  ref={(node) => {
                    if (node) {
                      questionCardRefs.current.set(String(question.id), node);
                    } else {
                      questionCardRefs.current.delete(String(question.id));
                    }
                  }}
                  type="button"
                >
                  <div className="phase3b-card-topline">
                    <span>{urgencyLabels[question.urgency] || question.urgency} - Updated {formatDate(question.updated_at)}</span>
                    <StatusBadge status={question.status} />
                  </div>
                  <strong>{question.question}</strong>
                </button>
            ))}
          </section>
        </aside>

        <article className="detail-panel phase3b-detail-panel" ref={detailPanelRef}>
          {selectedQuestion ? (
            <>
              <div className="document-header">
                <div>
                  <div className="eyebrow">{urgencyLabels[selectedQuestion.urgency] || selectedQuestion.urgency} - Updated {formatDate(selectedQuestion.updated_at)}</div>
                  <h2>{selectedQuestion.question}</h2>
                  <CanonTagBadges tags={entityTagsByKey[`question:${selectedQuestion.id}`] || []} />
                </div>
                <div className="inspector-header-actions">
                  <StatusBadge status={selectedQuestion.status} />
                  <button
                    className={`quiet-danger-button ${String(deleteConfirmId) === String(selectedQuestion.id) ? 'confirming' : ''}`}
                    disabled={deleting}
                    onClick={handleDeleteQuestion}
                    title={String(deleteConfirmId) === String(selectedQuestion.id) ? 'Confirm delete question' : 'Delete question'}
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {deleteMessage ? <p className="editor-message detail-message">{deleteMessage}</p> : null}
              <ResolutionEditor
                metadataSlot={(
                  <div className="question-metadata-slot">
                    <TagEditor
                      entityId={selectedQuestion.id}
                      entityType="question"
                      tags={entityTagsByKey[`question:${selectedQuestion.id}`] || []}
                    />
                    <div className="quiet-meta-row">
                      <span>{formatDependencyLine('Blocked by', selectedQuestion.blocked_by)}</span>
                      <span>{formatDependencyLine('Blocks', selectedQuestion.blocks)}</span>
                    </div>
                  </div>
                )}
                record={selectedQuestion}
                type="question"
              />
              <PromotionProvenance text={selectedQuestion.context} />
            </>
          ) : (
            <div className="placeholder-block">Questions are loading.</div>
          )}
        </article>
      </div>
    </section>
  );
}

function groupByUrgency(questions) {
  return questions.reduce((groups, question) => {
    groups[question.urgency] = groups[question.urgency] || [];
    groups[question.urgency].push(question);
    return groups;
  }, {});
}

function parseList(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatList(value) {
  const list = parseList(value);
  return list.length ? list.map((item) => `#${item}`).join(', ') : 'None';
}

function formatDependencyLine(label, value) {
  return `${label}: ${formatList(value)}`;
}

function formatDate(value) {
  if (!value) return 'pending';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value));
}
