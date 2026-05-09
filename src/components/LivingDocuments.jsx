import { useRevivalStore } from '../store.js';
import CarolineLogicMap from './CarolineLogicMap.jsx';
import DreadMap from './DreadMap.jsx';
import ObligationLedger from './ObligationLedger.jsx';
import ReWatchLedger from './ReWatchLedger.jsx';

export default function LivingDocuments() {
  const livingDocs = useRevivalStore((state) => state.livingDocs);

  return (
    <section className="view">
      <div className="eyebrow">Phase 1 Placeholder</div>
      <h1>Living Documents</h1>
      <div className="card-grid">
        <ReWatchLedger count={livingDocs.rewatch_ledger.length} />
        <DreadMap count={livingDocs.dread_map.length} />
        <ObligationLedger count={livingDocs.obligation_ledger.length} />
      </div>
      <CarolineLogicMap count={livingDocs.caroline_map.length} />
    </section>
  );
}
