import { useEffect, useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import EntityPreviewCard from './EntityPreviewCard.jsx';
import InspectorPanel from './InspectorPanel.jsx';
import MasterDetailShell from './MasterDetailShell.jsx';
import StatusBadge from './StatusBadge.jsx';

const tierLabels = {
  1: 'Tier 1 - Foundation',
  2: 'Tier 2 - Emotional Architecture',
  3: 'Tier 3 - Emotional Core',
  4: 'Tier 4 - Structural',
  5: 'Tier 5 - Pilot-Specific'
};

export default function DecisionTracker() {
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const activeDecisionId = useRevivalStore((state) => state.activeDecisionId);
  const decisions = useRevivalStore((state) => state.decisions);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
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

      <MasterDetailShell
        className={`decision-master-detail ${inspectorCollapsed ? 'inspector-collapsed' : ''}`}
        listLabel="Decisions"
        list={Object.entries(tierLabels).map(([tier, label]) => (
          <section className="phase3b-group" key={tier}>
            <h2>{label}</h2>
            {(groupedDecisions[tier] || []).map((decision) => (
              <EntityPreviewCard
                active={String(selectedDecision?.id) === String(decision.id)}
                kicker={`Decision #${decision.sequence_number}`}
                key={decision.id}
                meta={[formatDependencyLine('Blocked by', decision.blocked_by), formatDependencyLine('Blocks', decision.blocks)]}
                onSelect={() => selectDecision(decision.id)}
                status={<StatusBadge status={decision.status} />}
                summary={decision.answer || 'Answer pending.'}
                tags={entityTagsByKey[`decision:${decision.id}`] || []}
                title={decision.title}
                type="Decision"
              />
            ))}
          </section>
        ))}
        inspector={(
          <InspectorPanel
            badges={selectedDecision ? <CanonTagBadges tags={entityTagsByKey[`decision:${selectedDecision.id}`] || []} /> : null}
            className="phase3b-detail-panel"
            collapsed={inspectorCollapsed}
            emptyText="Decisions are loading. Phase 3B expects 15 seeded records."
            kicker="Selected Decision"
            meta={selectedDecision ? `Decision #${selectedDecision.sequence_number}` : null}
            onToggleCollapsed={() => setInspectorCollapsed((value) => !value)}
            status={selectedDecision ? <StatusBadge status={selectedDecision.status} /> : null}
            title={selectedDecision?.title}
          >
            {selectedDecision ? (
              <div className="field-grid">
                <Field title="Question" value={selectedDecision.question} />
                <Field title="Why First" value={selectedDecision.why_first} />
                <Field title="What We Know" value={selectedDecision.what_we_know} />
                <Field title="What Needs Deciding" value={selectedDecision.what_needs_deciding} />
                <Field title="Answer" value={selectedDecision.answer || 'Answer pending.'} />
                <Field title="Blocked By" value={formatList(selectedDecision.blocked_by)} />
                <Field title="Blocks" value={formatList(selectedDecision.blocks)} />
              </div>
            ) : null}
          </InspectorPanel>
        )}
      />
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

function formatDependencyLine(label, value) {
  return `${label}: ${formatList(value)}`;
}

function Field({ title, value }) {
  return (
    <div className="field-card">
      <strong>{title}</strong>
      <p>{value || 'Pending.'}</p>
    </div>
  );
}
