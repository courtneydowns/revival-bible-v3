import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function ObligationLedger({ entries = [] }) {
  return <LivingDocumentEntryList entries={entries} emptyLabel="No obligation ledger entries seeded." />;
}
