import { useEffect, useMemo } from 'react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import StatusBadge from './StatusBadge.jsx';
import StatusSelector from './StatusSelector.jsx';
import TagEditor from './TagEditor.jsx';

const urgencyLabels = {
  pinned: 'Pinned',
  tier1: 'Tier 1 - Blocks Pilot',
  tier2: 'Tier 2 - Blocks Season Overview',
  tier3: "Tier 3 - Blocks Writers' Room"
};

export default function QuestionsLog() {
  const activeQuestionId = useRevivalStore((state) => state.activeQuestionId);
  const questions = useRevivalStore((state) => state.questions);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const loadQuestions = useRevivalStore((state) => state.loadQuestions);
  const selectQuestion = useRevivalStore((state) => state.selectQuestion);
  const selectedQuestion = useMemo(
    () => questions.find((question) => String(question.id) === String(activeQuestionId)) || questions[0],
    [activeQuestionId, questions]
  );
  const groupedQuestions = useMemo(() => groupByUrgency(questions), [questions]);

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

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Questions</div>
      <h1>Questions Log</h1>
      <p className="dashboard-lede">Phase 3B open creative questions grouped by urgency.</p>

      <div className="phase3b-workspace">
        <aside className="phase3b-list-panel">
          {Object.entries(urgencyLabels).map(([urgency, label]) => (
            <section className="phase3b-group" key={urgency}>
              <h2>{label}</h2>
              {(groupedQuestions[urgency] || []).map((question) => (
                <button
                  className={`phase3b-card ${String(selectedQuestion?.id) === String(question.id) ? 'selected' : ''}`}
                  key={question.id}
                  onClick={() => selectQuestion(question.id)}
                  type="button"
                >
                  <div className="phase3b-card-topline">
                    <span>{urgencyLabels[question.urgency] || question.urgency}</span>
                    <StatusBadge status={question.status} />
                  </div>
                  <strong>{question.question}</strong>
                </button>
              ))}
            </section>
          ))}
        </aside>

        <article className="detail-panel phase3b-detail-panel">
          {selectedQuestion ? (
            <>
              <div className="document-header">
                <div>
                  <div className="eyebrow">{urgencyLabels[selectedQuestion.urgency] || selectedQuestion.urgency}</div>
                  <h2>{selectedQuestion.question}</h2>
                  <CanonTagBadges tags={entityTagsByKey[`question:${selectedQuestion.id}`] || []} />
                </div>
                <StatusBadge status={selectedQuestion.status} />
              </div>
              <div className="field-grid">
                <StatusSelector currentStatus={selectedQuestion.status} entityId={selectedQuestion.id} entityType="question" />
                <TagEditor
                  entityId={selectedQuestion.id}
                  entityType="question"
                  tags={entityTagsByKey[`question:${selectedQuestion.id}`] || []}
                />
                <Field title="Urgency" value={urgencyLabels[selectedQuestion.urgency] || selectedQuestion.urgency} />
                <Field title="Status" value={selectedQuestion.status} />
                <Field title="Answer" value={selectedQuestion.answer || 'Answer pending.'} />
                <Field title="Context" value={selectedQuestion.context || 'Context pending.'} />
                <Field title="Blocked By" value={formatList(selectedQuestion.blocked_by)} />
                <Field title="Blocks" value={formatList(selectedQuestion.blocks)} />
              </div>
            </>
          ) : (
            <div className="placeholder-block">Questions are loading. Phase 3B expects 49 seeded records.</div>
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

function Field({ title, value }) {
  return (
    <div className="field-card">
      <strong>{title}</strong>
      <p>{value || 'Pending.'}</p>
    </div>
  );
}
