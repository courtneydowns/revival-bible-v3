import { useRevivalStore } from '../store.js';
import { formatCentralTime } from '../time.js';

export default function StatusBar() {
  const databaseInfo = useRevivalStore((state) => state.databaseInfo);
  const saveState = useRevivalStore((state) => state.saveState);
  const path = databaseInfo.path || 'initializing';
  const saveText = getSaveText(saveState);

  return (
    <footer className="status-bar">
      <span>{saveText}</span>
      <span>Database {databaseInfo.connected ? 'connected' : 'pending'}: {path}</span>
    </footer>
  );
}

function getSaveText(saveState) {
  if (saveState.status === 'saving') return 'Saving changes...';
  if (saveState.status === 'failed') {
    const failedAt = saveState.savedAt
      ? ` — ${formatCentralTime(saveState.savedAt, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}`
      : '';
    return `Autosave failed${failedAt}`;
  }
  if (saveState.savedAt) {
    return `All changes saved — ${formatCentralTime(saveState.savedAt, { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}`;
  }

  return 'Autosave ready — no changes saved this session';
}
