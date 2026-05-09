import { useState } from 'react';
import { useRevivalStore } from '../store.js';

export default function SearchModal() {
  const closeSearch = useRevivalStore((state) => state.closeSearch);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const runSearch = async (nextQuery) => {
    setQuery(nextQuery);
    const response = await window.revival?.search.query(nextQuery);
    setResults(response?.results || []);
  };

  return (
    <div className="modal-backdrop">
      <section className="modal">
        <div className="eyebrow">Search</div>
        <h2>Project Search</h2>
        <div className="field">
          <label htmlFor="search-query">Query</label>
          <input autoFocus id="search-query" onChange={(event) => runSearch(event.target.value)} placeholder="Search is empty until Phase 2 seeding" value={query} />
        </div>
        <div className="placeholder-block">{results.length} results</div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={closeSearch} type="button">Close</button>
        </div>
      </section>
    </div>
  );
}
