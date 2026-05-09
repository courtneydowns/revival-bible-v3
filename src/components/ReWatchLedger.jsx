import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function ReWatchLedger({ entries = [] }) {
  return <LivingDocumentEntryList entries={entries} emptyLabel="No rewatch ledger entries seeded." />;
}
