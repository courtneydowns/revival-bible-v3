import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRevivalStore } from '../store.js';

const typeLabels = {
  bible_section: 'Story Bible',
  character: 'Character',
  episode: 'Episode',
  decision: 'Decision',
  question: 'Question',
  living_document: 'Living Document',
  timeline_event: 'Timeline'
};

const typeOrder = ['bible_section', 'episode', 'timeline_event', 'character', 'decision', 'question', 'living_document'];

export default function SearchModal() {
  const closeSearch = useRevivalStore((state) => state.closeSearch);
  const canonTags = useRevivalStore((state) => state.canonTags);
  const navigateToSearchResult = useRevivalStore((state) => state.navigateToSearchResult);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('Search across seeded bible sections, episodes, timeline events, characters, decisions, questions, and living documents.');
  const [loading, setLoading] = useState(false);

  const groupedResults = useMemo(() => groupResults(results), [results]);
  const searchableTags = useMemo(() => getSearchableTags(canonTags), [canonTags]);

  const runSearch = async (nextQuery) => {
    setQuery(nextQuery);

    if (!nextQuery.trim()) {
      setResults([]);
      setStatus('Search across seeded bible sections, episodes, timeline events, characters, decisions, questions, and living documents.');
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
        {searchableTags.length ? (
          <div className="searchable-tags" aria-label="Searchable tags">
            <span>Searchable Tags</span>
            <div className="searchable-tag-list">
              {searchableTags.map((tag) => (
                <button className={`searchable-tag color-${tag.color || 'default'}`} key={tag.slug} onClick={() => runSearch(tag.slug.replace(/-/g, ' '))} type="button">
                  {tag.slug}
                </button>
              ))}
            </div>
          </div>
        ) : null}
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
                    <MatchIndicator
                      matchedByStatus={result.matched_by_status}
                      matchedByTag={result.matched_by_tag}
                      statuses={result.matched_statuses}
                      tags={result.matched_tags}
                    />
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

function MatchIndicator({ matchedByStatus, matchedByTag, statuses = [], tags = [] }) {
  const matchType = matchedByTag ? 'tag' : matchedByStatus ? 'status' : 'text';
  const label = matchedByTag ? 'Tag Match' : matchedByStatus ? 'Status Match' : 'Text Match';

  return (
    <div className={`search-match-row ${matchType}`}>
      <span>{label}</span>
      {matchedByTag
        ? tags.map((tag) => (
          <mark className={`search-tag-match color-${tag.color || 'default'}`} key={`${tag.slug}-${tag.note || ''}`}>
            {tag.label}
          </mark>
        ))
        : null}
      {!matchedByTag && matchedByStatus
        ? statuses.map((status) => (
          <mark className="search-status-match" key={status}>
            {status}
          </mark>
        ))
        : null}
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

function getSearchableTags(tags) {
  const preferredOrder = ['canon', 'character', 'relationship', 'timeline', 'episode', 'unresolved', 'contradiction-risk', 'decision', 'question', 'location'];
  const bySlug = new Map(tags.map((tag) => [tag.slug, tag]));
  const preferredTags = preferredOrder.map((slug) => bySlug.get(slug)).filter(Boolean);
  const extraTags = tags
    .filter((tag) => !preferredOrder.includes(tag.slug))
    .sort((left, right) => left.label.localeCompare(right.label));

  return [...preferredTags, ...extraTags];
}
