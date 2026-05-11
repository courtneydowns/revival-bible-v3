import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import EntityPreviewCard from './EntityPreviewCard.jsx';
import InspectorPanel from './InspectorPanel.jsx';
import MasterDetailShell from './MasterDetailShell.jsx';
import PromotionProvenance from './PromotionProvenance.jsx';
import RelatedRecords from './RelatedRecords.jsx';
import ResolutionEditor from './ResolutionEditor.jsx';
import StatusBadge from './StatusBadge.jsx';
import TagEditor from './TagEditor.jsx';

const tierLabels = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Tier 4',
  5: 'Tier 5'
};
const tierDescriptions = {
  1: 'Series canon.',
  2: 'Emotional architecture.',
  3: 'Character core.',
  4: 'Structure.',
  5: 'Pilot refinement.'
};

export default function DecisionTracker() {
  const [inspectorCollapsed, setInspectorCollapsed] = useState(false);
  const [newDecisionTitle, setNewDecisionTitle] = useState('');
  const [createMessage, setCreateMessage] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [decisionSearch, setDecisionSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
  const createDecision = useRevivalStore((state) => state.createDecision);
  const deleteDecision = useRevivalStore((state) => state.deleteDecision);
  const selectDecision = useRevivalStore((state) => state.selectDecision);
  const orderedDecisions = useMemo(() => [...decisions].sort(compareDecisions), [decisions]);
  const visibleDecisions = useMemo(
    () => orderedDecisions.filter((decision) => {
      const query = decisionSearch.trim().toLowerCase();
      const matchesSearch = !query || [
        decision.title,
        decision.question,
        decision.final_decision,
        decision.answer,
        decision.blocked_by,
        decision.blocks
      ].filter(Boolean).join(' ').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || String(decision.status).toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    }),
    [decisionSearch, orderedDecisions, statusFilter]
  );
  const decisionStatuses = useMemo(
    () => ['all', ...new Set(orderedDecisions.map((decision) => String(decision.status || '').toLowerCase()).filter(Boolean))],
    [orderedDecisions]
  );
  const selectedDecision = useMemo(
    () => orderedDecisions.find((decision) => String(decision.id) === String(activeDecisionId)) || orderedDecisions[0],
    [activeDecisionId, orderedDecisions]
  );
  const groupedDecisions = useMemo(() => groupByTier(visibleDecisions), [visibleDecisions]);

  useEffect(() => {
    if (!decisions.length) {
      loadDecisions();
    }
  }, [decisions.length, loadDecisions]);

  useEffect(() => {
    if (!activeDecisionId && orderedDecisions.length) {
      selectDecision(orderedDecisions[0].id);
    }
  }, [activeDecisionId, orderedDecisions, selectDecision]);

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

  const handleCreateDecision = async (event) => {
    event.preventDefault();
    const title = newDecisionTitle.trim();
    if (!title || creating) return;

    setCreating(true);
    setCreateMessage('');
    try {
      const response = await createDecision({ title, question: title });
      if (response?.ok) {
        setNewDecisionTitle('');
        setCreateMessage('Decision created.');
      } else {
        setCreateMessage(response?.message || 'Decision was not created.');
      }
    } catch (error) {
      setCreateMessage(error?.message || 'Decision was not created.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteDecision = async () => {
    if (!selectedDecision || deleting) return;

    if (String(deleteConfirmId) !== String(selectedDecision.id)) {
      setDeleteConfirmId(selectedDecision.id);
      setDeleteMessage('Select delete again to confirm.');
      return;
    }

    setDeleting(true);
    setDeleteMessage('');
    try {
      const response = await deleteDecision(selectedDecision.id);
      if (!response?.ok) {
        setDeleteMessage(response?.message || 'Decision was not deleted.');
      } else {
        setDeleteConfirmId(null);
      }
    } catch (error) {
      setDeleteMessage(error?.message || 'Decision was not deleted.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Decisions</div>
      <h1>Decision Tracker</h1>
      <p className="dashboard-lede">Canon decisions, blockers, and downstream dependencies for editorial review.</p>

      <MasterDetailShell
        className={`decision-master-detail ${inspectorCollapsed ? 'inspector-collapsed' : ''}`}
        listLabel="Decisions"
        listRef={listPanelRef}
        list={(
          <>
            <div className="editorial-list-tools">
              <label className="editorial-search-field">
                <Search size={15} />
                <input
                  onChange={(event) => setDecisionSearch(event.target.value)}
                  placeholder="Search decisions"
                  value={decisionSearch}
                />
              </label>
              <select
                aria-label="Filter decisions by status"
                onChange={(event) => setStatusFilter(event.target.value)}
                value={statusFilter}
              >
                {decisionStatuses.map((status) => (
                  <option key={status} value={status}>{status === 'all' ? 'All statuses' : formatLabel(status)}</option>
                ))}
              </select>
            </div>
            <form className="record-create-row compact-create-row" onSubmit={handleCreateDecision}>
              <input
                aria-label="New decision title"
                disabled={creating}
                onChange={(event) => setNewDecisionTitle(event.target.value)}
                placeholder="New decision title"
                value={newDecisionTitle}
              />
              <button className="secondary-button" disabled={creating || !newDecisionTitle.trim()} type="submit">
                Add
              </button>
              {createMessage ? <p className="editor-message">{createMessage}</p> : null}
            </form>
            {Object.entries(tierLabels).map(([tier, label]) => (
              <section className="phase3b-group" key={tier}>
                <h2>{label}<small>{tierDescriptions[tier]}</small></h2>
                {(groupedDecisions[tier] || []).map((decision) => (
                  <EntityPreviewCard
                    active={String(selectedDecision?.id) === String(decision.id)}
                    kicker={`Tier ${decision.tier} - Updated ${formatDate(decision.updated_at)}`}
                    key={decision.id}
                    meta={[formatDependencyLine('Blocked by', decision.blocked_by), formatDependencyLine('Blocks', decision.blocks)]}
                    onSelect={(event) => handleDecisionSelect(decision.id, event)}
                    status={<StatusBadge status={decision.status} />}
                    summary={decision.final_decision || decision.answer || 'Final decision pending.'}
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
          </>
        )}
        inspector={(
          <InspectorPanel
            badges={selectedDecision ? <CanonTagBadges tags={entityTagsByKey[`decision:${selectedDecision.id}`] || []} /> : null}
            className="phase3b-detail-panel"
            collapsed={inspectorCollapsed}
            emptyText="Decisions are loading."
            kicker="Selected Decision"
            key={selectedDecision ? `decision-detail-${selectedDecision.id}` : 'decision-detail-empty'}
            meta={selectedDecision ? `Tier ${selectedDecision.tier} - Updated ${formatDate(selectedDecision.updated_at)}` : null}
            onToggleCollapsed={() => setInspectorCollapsed((value) => !value)}
            panelRef={detailPanelRef}
            status={selectedDecision ? (
              <>
                <StatusBadge status={selectedDecision.status} />
                <button
                  className={`quiet-danger-button ${String(deleteConfirmId) === String(selectedDecision.id) ? 'confirming' : ''}`}
                  disabled={deleting}
                  onClick={handleDeleteDecision}
                  title={String(deleteConfirmId) === String(selectedDecision.id) ? 'Confirm delete decision' : 'Delete decision'}
                  type="button"
                >
                  <Trash2 size={15} />
                </button>
              </>
            ) : null}
            title={selectedDecision?.title}
          >
            {selectedDecision ? (
              <>
                {deleteMessage ? <p className="editor-message detail-message">{deleteMessage}</p> : null}
                <ResolutionEditor record={selectedDecision} type="decision" />
                <TagEditor
                  entityId={selectedDecision.id}
                  entityType="decision"
                  tags={entityTagsByKey[`decision:${selectedDecision.id}`] || []}
                />
                <div className="quiet-meta-row">
                  <span>{formatDependencyLine('Blocked by', selectedDecision.blocked_by)}</span>
                  <span>{formatDependencyLine('Blocks', selectedDecision.blocks)}</span>
                </div>
                <PromotionProvenance text={selectedDecision.what_we_know} />
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

function compareDecisions(a, b) {
  return Number(a.sequence_number || 0) - Number(b.sequence_number || 0)
    || Number(a.id || 0) - Number(b.id || 0);
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

function formatLabel(value) {
  return String(value || '')
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
