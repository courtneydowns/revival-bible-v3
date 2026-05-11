import { useEffect } from 'react';
import { useRevivalStore } from '../store.js';
import CarolineLogicMap from './CarolineLogicMap.jsx';
import DreadMap from './DreadMap.jsx';
import ObligationLedger from './ObligationLedger.jsx';
import ReWatchLedger from './ReWatchLedger.jsx';

const documentTypes = [
  ['rewatch_ledger', 'Rewatch Ledger', ReWatchLedger],
  ['locations', 'Locations', ReWatchLedger],
  ['dread_map', 'Dread Map', DreadMap],
  ['obligation_ledger', 'Obligation Ledger', ObligationLedger],
  ['caroline_map', 'Caroline Logic Map', CarolineLogicMap]
];

export default function LivingDocuments() {
  const livingDocs = useRevivalStore((state) => state.livingDocs);
  const activeLivingDocType = useRevivalStore((state) => state.activeLivingDocType);
  const activeLivingDocEntryId = useRevivalStore((state) => state.activeLivingDocEntryId);
  const loadLivingDocs = useRevivalStore((state) => state.loadLivingDocs);
  const setActiveLivingDocType = useRevivalStore((state) => state.setActiveLivingDocType);
  const activeType = activeLivingDocType || 'rewatch_ledger';
  const activeConfig = documentTypes.find(([docType]) => docType === activeType) || documentTypes[0];
  const ActiveComponent = activeConfig[2];

  useEffect(() => {
    const totalRows = Object.values(livingDocs).reduce((total, entries) => total + entries.length, 0);
    if (!totalRows) {
      loadLivingDocs();
    }
  }, [livingDocs, loadLivingDocs]);

  return (
    <section className="view phase3b-view">
      <div className="eyebrow">Living Documents / Read Only</div>
      <h1>Living Documents</h1>
      <p className="dashboard-lede">Framework entries for rewatch logic, dread accumulation, obligation, and Caroline's hidden map.</p>

      <div className="living-tabs" aria-label="Living document type selector">
        {documentTypes.map(([docType, label]) => (
          <button
            className={docType === activeType ? 'active' : ''}
            key={docType}
            onClick={() => setActiveLivingDocType(docType)}
            type="button"
          >
            {label}
            <span>{livingDocs[docType]?.length || 0}</span>
          </button>
        ))}
      </div>

      <div className="living-document-panel">
        <ActiveComponent activeEntryId={activeLivingDocEntryId} entries={livingDocs[activeConfig[0]] || []} />
      </div>
    </section>
  );
}
