import { useMemo, useState } from 'react';
import { useRevivalStore } from '../store.js';

const preferredStatuses = [
  'canon',
  'established',
  'developing',
  'provisional',
  'unresolved',
  'contradiction-risk',
  'needed',
  'open',
  'locked'
];

export default function StatusSelector({ currentStatus, entityId, entityType, label = 'Status' }) {
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const updateEntityStatus = useRevivalStore((state) => state.updateEntityStatus);
  const statusOptions = useMemo(
    () => [...new Set([currentStatus, ...preferredStatuses].filter(Boolean).map((status) => String(status).toLowerCase()))],
    [currentStatus]
  );

  const updateStatus = async (event) => {
    const status = event.target.value;
    if (!status || status === currentStatus || saving) return;

    setSaving(true);
    setMessage('');
    try {
      const response = await updateEntityStatus({ entityType, entityId, status });
      if (!response?.ok) {
        setMessage(response?.message || 'Status was not updated.');
      }
    } catch (error) {
      setMessage(error?.message || 'Status was not updated.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="inspector-editor compact" aria-label={`${label} editor`}>
      <label>
        <span>{label}</span>
        <select disabled={saving} onChange={updateStatus} value={String(currentStatus || 'developing').toLowerCase()}>
          {statusOptions.map((status) => (
            <option key={status} value={status}>{formatStatus(status)}</option>
          ))}
        </select>
      </label>
      {message ? <p className="editor-message">{message}</p> : null}
    </section>
  );
}

function formatStatus(status) {
  return String(status || '')
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
