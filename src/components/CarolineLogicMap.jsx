import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function CarolineLogicMap({ activeEntryId, entries = [] }) {
  return <LivingDocumentEntryList activeEntryId={activeEntryId} entries={entries} emptyLabel="No Caroline logic map entries seeded." />;
}
