import { useRevivalStore } from '../store.js';

export default function StatusBar() {
  const databaseInfo = useRevivalStore((state) => state.databaseInfo);
  const path = databaseInfo.path || 'initializing';

  return (
    <footer className="status-bar">
      <span>Autosave idle</span>
      <span>Database {databaseInfo.connected ? 'connected' : 'pending'}: {path}</span>
    </footer>
  );
}
