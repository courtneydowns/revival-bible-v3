import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function ReWatchLedger({ activeEntryId, entries = [] }) {
  return <LivingDocumentEntryList activeEntryId={activeEntryId} entries={entries} emptyLabel="No rewatch ledger entries seeded." />;
}
