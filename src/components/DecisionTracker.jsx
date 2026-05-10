import { useEffect, useMemo, useRef, useState } from 'react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import EntityPreviewCard from './EntityPreviewCard.jsx';
import InspectorPanel from './InspectorPanel.jsx';
import MasterDetailShell from './MasterDetailShell.jsx';
import RelatedRecords from './RelatedRecords.jsx';
import StatusBadge from './StatusBadge.jsx';
import StatusSelector from './StatusSelector.jsx';
import TagEditor from './TagEditor.jsx';

const tierLabels = {
  1: 'Tier 1 - Foundation',
  2: 'Tier 2 - Emotional Architecture',
  3: 'Tier 3 - Emotional Core',
  4: 'Tier 4 - Structural',
  5: 'Tier 5 - Pilot-Specific'
};

export default function DecisionTracker() {
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const appliedNavigationFocusTick = useRef(0);
  const decisionCardRefs = useRef(new Map());
  const detailPanelRef = useRef(null);
  const listPanelRef = useRef(null);
  const activeDecisionId = useRevivalStore((state) => state.activeDecisionId);
  const decisions = useRevivalStore((state) => state.decisions);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const entityLinksByKey = useRevivalStore((state) => state.entityLinksByKey);
  const navigationFocusTick = useRevivalStore((state) => state.navigationFocusTick);
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

  useEffect(() => {
    if (!activeDecisionId) return;

    scheduleDetailScrollTop(detailPanelRef.current);
  }, [activeDecisionId, decisions.length]);

  useEffect(() => {
    if (!activeDecisionId || !navigationFocusTick) return;
    if (appliedNavigationFocusTick.current === navigationFocusTick) return;

    appliedNavigationFocusTick.current = navigationFocusTick;
    scheduleRecordScroll(decisionCardRefs.current.get(String(activeDecisionId)), listPanelRef.current);
  }, [activeDecisionId, decisions.length, navigationFocusTick]);

  const handleDecisionSelect = (decisionId, event) => {
    event?.currentTarget?.blur();
    selectDecision(decisionId);
    scheduleDetailScrollTop(detailPanelRef.current);
  };

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Decisions</div>
      <h1>Decision Tracker</h1>
      <p className="dashboard-lede">Phase 3B pre-writing decisions, blockers, and downstream dependencies.</p>

      <MasterDetailShell
        className={`decision-master-detail ${inspectorCollapsed ? 'inspector-collapsed' : ''}`}
        listLabel="Decisions"
        listRef={listPanelRef}
        list={Object.entries(tierLabels).map(([tier, label]) => (
          <section className="phase3b-group" key={tier}>
            <h2>{label}</h2>
            {(groupedDecisions[tier] || []).map((decision) => (
              <EntityPreviewCard
                active={String(selectedDecision?.id) === String(decision.id)}
                kicker={`Decision #${decision.sequence_number}`}
                key={decision.id}
                meta={[formatDependencyLine('Blocked by', decision.blocked_by), formatDependencyLine('Blocks', decision.blocks)]}
                onSelect={(event) => handleDecisionSelect(decision.id, event)}
                status={<StatusBadge status={decision.status} />}
                summary={decision.answer || 'Answer pending.'}
                tags={entityTagsByKey[`decision:${decision.id}`] || []}
                title={decision.title}
                type="Decision"
                ref={(node) => {
                  if (node) {
                    decisionCardRefs.current.set(String(decision.id), node);
                  } else {
                    decisionCardRefs.current.delete(String(decision.id));
                  }
                }}
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
            key={selectedDecision ? `decision-detail-${selectedDecision.id}` : 'decision-detail-empty'}
            meta={selectedDecision ? `Decision #${selectedDecision.sequence_number}` : null}
            onToggleCollapsed={() => setInspectorCollapsed((value) => !value)}
            panelRef={detailPanelRef}
            status={selectedDecision ? <StatusBadge status={selectedDecision.status} /> : null}
            title={selectedDecision?.title}
          >
            {selectedDecision ? (
              <>
                <StatusSelector
                  currentStatus={selectedDecision.status}
                  entityId={selectedDecision.id}
                  entityType="decision"
                />
                <TagEditor
                  entityId={selectedDecision.id}
                  entityType="decision"
                  tags={entityTagsByKey[`decision:${selectedDecision.id}`] || []}
                />
                <div className="field-grid">
                  <Field title="Question" value={selectedDecision.question} />
                  <Field title="Why First" value={selectedDecision.why_first} />
                  <Field title="What We Know" value={selectedDecision.what_we_know} />
                  <Field title="What Needs Deciding" value={selectedDecision.what_needs_deciding} />
                  <Field title="Answer" value={selectedDecision.answer || 'Answer pending.'} />
                  <Field title="Blocked By" value={formatList(selectedDecision.blocked_by)} />
                  <Field title="Blocks" value={formatList(selectedDecision.blocks)} />
                </div>
                <RelatedRecords
                  entityId={selectedDecision.id}
                  entityType="decision"
                  links={entityLinksByKey[`decision:${selectedDecision.id}`] || []}
                />
              </>
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

function scheduleRecordScroll(card, listPanel) {
  if (!card || !listPanel) return;

  const scroll = () => {
    if (!card.isConnected || !listPanel.isConnected) return;

    const scrollContainer = getScrollContainer(card, listPanel);
    const cardRect = card.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const centerOffset = Math.max((scrollContainer.clientHeight - cardRect.height) / 2, 0);
    const nextTop = scrollContainer.scrollTop + cardRect.top - containerRect.top - centerOffset;

    scrollContainer.scrollTop = Math.max(nextTop, 0);
    ensureViewportVisible(card);

    card.focus({ preventScroll: true });
  };

  requestAnimationFrame(scroll);
  setTimeout(scroll, 50);
  setTimeout(scroll, 150);
  setTimeout(scroll, 500);
  setTimeout(scroll, 1000);
}

function scheduleDetailScrollTop(detailPanel) {
  if (!detailPanel) return;

  const scroll = () => {
    if (!detailPanel.isConnected) return;
    const header = detailPanel.querySelector('.inspector-panel-header');

    detailPanel.scrollTop = 0;
    if (header) {
      ensureViewportVisible(header);
    }
  };

  scroll();
  requestAnimationFrame(scroll);
  setTimeout(scroll, 50);
  setTimeout(scroll, 150);
}

function getScrollContainer(card, fallback) {
  let current = card.parentElement;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const canScroll = /(auto|scroll)/.test(style.overflowY) && current.scrollHeight > current.clientHeight + 1;
    if (canScroll) return current;
    current = current.parentElement;
  }

  return fallback;
}

function ensureViewportVisible(card) {
  const rect = card.getBoundingClientRect();
  if (rect.bottom > 0 && rect.top < window.innerHeight) return;

  const content = document.querySelector('.content');
  if (!content || content.scrollHeight <= content.clientHeight + 1) return;

  const contentRect = content.getBoundingClientRect();
  const centerOffset = Math.max((content.clientHeight - rect.height) / 2, 0);
  content.scrollTop = Math.max(content.scrollTop + rect.top - contentRect.top - centerOffset, 0);
}
