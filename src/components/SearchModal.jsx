import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRevivalStore } from '../store.js';

const typeLabels = {
  bible_section: 'Story Bible',
  character: 'Character',
  episode: 'Episode',
  decision: 'Decision',
  question: 'Question',
  living_document: 'Living Document'
};

const typeOrder = ['bible_section', 'episode', 'character', 'decision', 'question', 'living_document'];

export default function SearchModal() {
  const closeSearch = useRevivalStore((state) => state.closeSearch);
  const navigateToSearchResult = useRevivalStore((state) => state.navigateToSearchResult);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('Search across seeded bible sections, episodes, characters, decisions, questions, and living documents.');
  const [loading, setLoading] = useState(false);

  const groupedResults = useMemo(() => groupResults(results), [results]);

  const runSearch = async (nextQuery) => {
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setResults([]);
      setStatus('Search across seeded bible sections, episodes, characters, decisions, questions, and living documents.');
      return;
    }

    setLoading(true);
    try {
      const response = await window.revival?.search.query(nextQuery);
      const nextResults = response?.results || [];
      setResults(nextResults);
      setStatus(nextResults.length ? `${nextResults.length} result${nextResults.length === 1 ? '' : 's'} found.` : 'No matches yet.');
    } catch (error) {
      setResults([]);
      setStatus(error?.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const rebuildIndex = async () => {
    setLoading(true);
    try {
      const response = await window.revival?.search.rebuildIndex();
      setStatus(response?.indexed ? `Search index rebuilt with ${response.indexed} entries.` : 'Search index rebuilt.');
      if (query.trim()) {
        const searchResponse = await window.revival?.search.query(query);
        setResults(searchResponse?.results || []);
      }
    } catch (error) {
      setStatus(error?.message || 'Index rebuild failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <section className="modal search-modal">
        <div className="search-modal-header">
          <div>
            <div className="eyebrow">Search</div>
            <h2>Project Search</h2>
          </div>
          <button className="icon-button" disabled={loading} onClick={rebuildIndex} title="Rebuild search index" type="button">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="field">
          <label htmlFor="search-query">Query</label>
          <input autoFocus id="search-query" onChange={(event) => runSearch(event.target.value)} placeholder="Search Revival canon, episodes, decisions..." value={query} />
        </div>
        <div className="search-status">{loading ? 'Searching...' : status}</div>

        <div className="search-results" aria-live="polite">
          {groupedResults.map(([entityType, items]) => (
            <section className="search-result-group" key={entityType}>
              <h3>{typeLabels[entityType] || entityType}</h3>
              <div className="search-result-list">
                {items.map((result) => (
                  <button className="search-result" key={`${result.entity_type}-${result.entity_id}`} onClick={() => navigateToSearchResult(result)} type="button">
                    <div className="search-result-topline">
                      <span>{typeLabels[result.entity_type] || result.entity_type}</span>
                      {result.section_path ? <small>{result.section_path}</small> : null}
                    </div>
                    <strong>{result.title}</strong>
                    <p dangerouslySetInnerHTML={{ __html: sanitizeSnippet(result.snippet) }} />
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="modal-actions">
          <button className="secondary-button" onClick={closeSearch} type="button">Close</button>
        </div>
      </section>
    </div>
  );
}

function groupResults(results) {
  const groups = new Map();
  for (const result of results) {
    const entityType = result.entity_type || 'other';
    if (!groups.has(entityType)) {
      groups.set(entityType, []);
    }
    groups.get(entityType).push(result);
  }

  return [...groups.entries()].sort(([left], [right]) => {
    const leftIndex = typeOrder.indexOf(left);
    const rightIndex = typeOrder.indexOf(right);
    return (leftIndex === -1 ? typeOrder.length : leftIndex) - (rightIndex === -1 ? typeOrder.length : rightIndex);
  });
}

function sanitizeSnippet(value) {
  return String(value || 'No preview available.')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&lt;mark&gt;/g, '<mark>')
    .replace(/&lt;\/mark&gt;/g, '</mark>');
}
