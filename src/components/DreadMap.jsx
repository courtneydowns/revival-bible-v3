import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function DreadMap({ entries = [] }) {
  return <LivingDocumentEntryList entries={entries} emptyLabel="No dread map entries seeded." />;
}
