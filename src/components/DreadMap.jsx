import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function DreadMap({ activeEntryId, entries = [] }) {
  return <LivingDocumentEntryList activeEntryId={activeEntryId} entries={entries} emptyLabel="No dread map entries seeded." />;
}
