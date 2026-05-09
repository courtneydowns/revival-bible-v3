import { LivingDocumentEntryList } from './livingDocumentRenderers.jsx';

export default function CarolineLogicMap({ entries = [] }) {
  return <LivingDocumentEntryList entries={entries} emptyLabel="No Caroline logic map entries seeded." />;
}
