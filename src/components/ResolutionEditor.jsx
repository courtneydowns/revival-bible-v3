import { useEffect, useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';

const questionStates = ['open', 'tentatively-answered', 'resolved', 'deprecated'];
const decisionStates = ['proposed', 'accepted', 'implemented', 'reversed', 'deprecated'];

export default function ResolutionEditor({ record, type }) {
  const [draft, setDraft] = useState(() => getDraft(record, type));
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const updateDecisionResolution = useRevivalStore((state) => state.updateDecisionResolution);
  const updateQuestionResolution = useRevivalStore((state) => state.updateQuestionResolution);
  const finalField = type === 'decision' ? 'final_decision' : 'final_answer';
  const finalLabel = type === 'decision' ? 'Final Decision' : 'Final Answer';
  const contentFields = type === 'decision' ? decisionContentFields : questionContentFields;
  const states = useMemo(() => {
    const options = type === 'decision' ? decisionStates : questionStates;
    return [...new Set([record?.status, ...options].filter(Boolean).map((status) => String(status).toLowerCase()))];
  }, [record?.status, type]);

  useEffect(() => {
    setDraft(getDraft(record, type));
    setMessage('');
  }, [
    record?.id,
    record?.status,
    record?.title,
    record?.question,
    record?.why_first,
    record?.what_we_know,
    record?.what_needs_deciding,
    record?.urgency,
    record?.context,
    record?.final_decision,
    record?.final_answer,
    record?.rationale,
    record?.resolution_notes,
    type
  ]);

  if (!record) return null;

  const saveResolution = async () => {
    if (saving) return;

    setSaving(true);
    setMessage('');
    try {
      const update = type === 'decision' ? updateDecisionResolution : updateQuestionResolution;
      const response = await update({ id: record.id, ...draft });
      setMessage(response?.ok ? 'Resolution saved.' : response?.message || 'Resolution was not saved.');
    } catch (error) {
      setMessage(error?.message || 'Resolution was not saved.');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (status) => {
    const nextDraft = { ...draft, status };
    setDraft(nextDraft);
    setSaving(true);
    setMessage('');
    try {
      const update = type === 'decision' ? updateDecisionResolution : updateQuestionResolution;
      const response = await update({ id: record.id, ...nextDraft });
      setMessage(response?.ok ? 'Resolution saved.' : response?.message || 'Resolution was not saved.');
    } catch (error) {
      setMessage(error?.message || 'Resolution was not saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={`resolution-editor ${type}-resolution-editor`} aria-label={`${finalLabel} editor`}>
      <div className="resolution-editor-header">
        <div>
          <strong>{type === 'decision' ? 'Decision Notes' : 'Question Notes'}</strong>
          <p>{getSummaryText(type, draft.status)}</p>
        </div>
        <span>Last updated {formatDate(record.updated_at)}</span>
      </div>

      <label className="resolution-status-control">
        <span>Resolution State</span>
        <select disabled={saving} value={draft.status} onChange={(event) => updateStatus(event.target.value)}>
          {states.map((status) => (
            <option key={status} value={status}>{formatLabel(status)}</option>
          ))}
        </select>
      </label>

      {contentFields.map((field) => (
        <label className={`resolution-field field-${field.name}`} key={field.name}>
          <span>{field.label}</span>
          {field.type === 'select' ? (
            <select
              disabled={saving}
              onChange={(event) => setDraft({ ...draft, [field.name]: event.target.value })}
              value={draft[field.name]}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <textarea
              disabled={saving}
              onChange={(event) => setDraft({ ...draft, [field.name]: event.target.value })}
              placeholder={field.placeholder}
              rows={field.rows}
              value={draft[field.name]}
            />
          )}
        </label>
      ))}

      <label className={`resolution-field field-${finalField}`}>
        <span>{finalLabel}</span>
        <textarea
          disabled={saving}
          onChange={(event) => setDraft({ ...draft, [finalField]: event.target.value })}
          placeholder={`${finalLabel} pending.`}
          rows={4}
          value={draft[finalField]}
        />
      </label>

      <label className="resolution-field field-rationale">
        <span>Rationale</span>
        <textarea
          disabled={saving}
          onChange={(event) => setDraft({ ...draft, rationale: event.target.value })}
          placeholder="Why this resolution was chosen."
          rows={3}
          value={draft.rationale}
        />
      </label>

      <label className="resolution-field field-resolution_notes">
        <span>Resolution Notes</span>
        <textarea
          disabled={saving}
          onChange={(event) => setDraft({ ...draft, resolution_notes: event.target.value })}
          placeholder="Optional editorial notes."
          rows={3}
          value={draft.resolution_notes}
        />
      </label>

      <div className="resolution-editor-footer">
        <button className="secondary-button" disabled={saving} onClick={saveResolution} type="button">
          {saving ? 'Saving...' : 'Save Resolution'}
        </button>
        {message ? <p className="editor-message">{message}</p> : null}
      </div>
    </section>
  );
}

function getDraft(record, type) {
  return {
    status: String(record?.status || (type === 'decision' ? 'proposed' : 'open')).toLowerCase(),
    title: record?.title || '',
    question: record?.question || '',
    why_first: record?.why_first || '',
    what_we_know: record?.what_we_know || '',
    what_needs_deciding: record?.what_needs_deciding || '',
    urgency: record?.urgency || 'tier3',
    context: record?.context || '',
    final_decision: record?.final_decision || '',
    final_answer: record?.final_answer || '',
    rationale: record?.rationale || '',
    resolution_notes: record?.resolution_notes || ''
  };
}

const decisionContentFields = [
  { name: 'title', label: 'Decision Title', placeholder: 'Decision title.', rows: 2 },
  { name: 'question', label: 'Question', placeholder: 'What needs deciding?', rows: 3 },
  { name: 'why_first', label: 'Why First', placeholder: 'Why this decision matters now.', rows: 3 },
  { name: 'what_we_know', label: 'What We Know', placeholder: 'Known context.', rows: 4 },
  { name: 'what_needs_deciding', label: 'What Needs Deciding', placeholder: 'Remaining decision points.', rows: 3 }
];

const questionContentFields = [
  { name: 'question', label: 'Question', placeholder: 'Question text.', rows: 3 },
  {
    name: 'urgency',
    label: 'Urgency',
    type: 'select',
    options: [
      { value: 'pinned', label: 'Pinned' },
      { value: 'tier1', label: 'Tier 1 - Blocks Pilot' },
      { value: 'tier2', label: 'Tier 2 - Blocks Season Overview' },
      { value: 'tier3', label: "Tier 3 - Blocks Writers' Room" }
    ]
  },
  { name: 'context', label: 'Context', placeholder: 'Question context.', rows: 4 }
];

function getSummaryText(type, status) {
  if (type === 'decision') {
    return `Decision state: ${formatLabel(status)}. Manual editorial authority preserved.`;
  }

  return `Question state: ${formatLabel(status)}. Nothing becomes canon automatically.`;
}

function formatDate(value) {
  return formatCentralTime(value, { fallback: 'pending', dateStyle: 'medium', timeStyle: 'short' });
}

function formatLabel(value) {
  return String(value || '')
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
