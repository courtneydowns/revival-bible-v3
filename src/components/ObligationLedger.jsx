import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function ObligationLedger({ activeEntryId, entries = [] }) {
  return <LivingDocumentEntryList activeEntryId={activeEntryId} entries={entries} emptyLabel="No obligation ledger entries seeded." />;
}
