import { useEffect, useMemo } from 'react';
import { useRevivalStore } from '../store.js';
import StatusBadge from './StatusBadge.jsx';

const tierLabels = {
  1: 'Tier 1 - Foundation',
  2: 'Tier 2 - Emotional Architecture',
  3: 'Tier 3 - Emotional Core',
  4: 'Tier 4 - Structural',
  5: 'Tier 5 - Pilot-Specific'
};

export default function DecisionTracker() {
  const activeDecisionId = useRevivalStore((state) => state.activeDecisionId);
  const decisions = useRevivalStore((state) => state.decisions);
  const loadDecisions = useRevivalStore((state) => state.loadDecisions);
  const selectDecision = useRevivalStore((state) => state.selectDecision);
  const selectedDecision = useMemo(
    () => decisions.find((decision) => String(decision.id) === String(activeDecisionId)) || decisions[0],
    [activeDecisionId, decisions]
  );
  const groupedDecisions = useMemo(() => groupByTier(decisions), [decisions]);

  useEffect(() => {
    if (!decisions.length) {
      loadDecisions();
    }
  }, [decisions.length, loadDecisions]);

  useEffect(() => {
    if (!activeDecisionId && decisions.length) {
      selectDecision(decisions[0].id);
    }
  }, [activeDecisionId, decisions, selectDecision]);

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Decisions / Read Only</div>
      <h1>Decision Tracker</h1>
      <p className="dashboard-lede">Phase 3B pre-writing decisions, blockers, and downstream dependencies.</p>

      <div className="phase3b-workspace">
        <aside className="phase3b-list-panel">
          {Object.entries(tierLabels).map(([tier, label]) => (
            <section className="phase3b-group" key={tier}>
              <h2>{label}</h2>
              {(groupedDecisions[tier] || []).map((decision) => (
                <button
                  className={`phase3b-card ${String(selectedDecision?.id) === String(decision.id) ? 'selected' : ''}`}
                  key={decision.id}
                  onClick={() => selectDecision(decision.id)}
                  type="button"
                >
                  <div className="phase3b-card-topline">
                    <span>Decision #{decision.sequence_number}</span>
                    <StatusBadge status={decision.status} />
                  </div>
                  <strong>{decision.title}</strong>
                  <DependencyLine label="Blocked by" value={decision.blocked_by} />
                  <DependencyLine label="Blocks" value={decision.blocks} />
                  <p>{decision.answer || 'Answer pending.'}</p>
                </button>
              ))}
            </section>
          ))}
        </aside>

        <article className="detail-panel phase3b-detail-panel">
          {selectedDecision ? (
            <>
              <div className="document-header">
                <div>
                  <div className="eyebrow">Decision #{selectedDecision.sequence_number}</div>
                  <h2>{selectedDecision.title}</h2>
                </div>
                <StatusBadge status={selectedDecision.status} />
              </div>
              <div className="field-grid">
                <Field title="Question" value={selectedDecision.question} />
                <Field title="Why First" value={selectedDecision.why_first} />
                <Field title="What We Know" value={selectedDecision.what_we_know} />
                <Field title="What Needs Deciding" value={selectedDecision.what_needs_deciding} />
                <Field title="Answer" value={selectedDecision.answer || 'Answer pending.'} />
                <Field title="Blocked By" value={formatList(selectedDecision.blocked_by)} />
                <Field title="Blocks" value={formatList(selectedDecision.blocks)} />
              </div>
            </>
          ) : (
            <div className="placeholder-block">Decisions are loading. Phase 3B expects 15 seeded records.</div>
          )}
        </article>
      </div>
    </section>
  );
}

function groupByTier(decisions) {
  return decisions.reduce((groups, decision) => {
    const tier = String(decision.tier);
    groups[tier] = groups[tier] || [];
    groups[tier].push(decision);
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

function DependencyLine({ label, value }) {
  return (
    <span className="dependency-line">
      {label}: {formatList(value)}
    </span>
  );
}

function Field({ title, value }) {
  return (
    <div className="field-card">
      <strong>{title}</strong>
      <p>{value || 'Pending.'}</p>
    </div>
  );
}
