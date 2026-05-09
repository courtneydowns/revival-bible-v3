import { useEffect, useMemo } from 'react';
import { useRevivalStore } from '../store.js';
import EpisodeDetail from './EpisodeDetail.jsx';
import StatusBadge from './StatusBadge.jsx';

const seasons = [1, 2, 3];

export default function EpisodeGuide() {
  const activeEpisodeSeason = useRevivalStore((state) => state.activeEpisodeSeason);
  const activeEpisodeId = useRevivalStore((state) => state.activeEpisodeId);
  const episodes = useRevivalStore((state) => state.episodes);
  const storedSelectedEpisode = useRevivalStore((state) => state.selectedEpisode);
  const loadEpisodes = useRevivalStore((state) => state.loadEpisodes);
  const selectEpisode = useRevivalStore((state) => state.selectEpisode);
  const setActiveEpisodeSeason = useRevivalStore((state) => state.setActiveEpisodeSeason);
  const seasonEpisodes = useMemo(
    () => episodes.filter((episode) => episode.season === activeEpisodeSeason),
    [activeEpisodeSeason, episodes]
  );
  const selectedEpisode = useMemo(
    () => episodes.find((episode) => String(episode.id) === String(activeEpisodeId)) || storedSelectedEpisode,
    [activeEpisodeId, episodes, storedSelectedEpisode]
  );

  useEffect(() => {
    if (!episodes.length) {
      loadEpisodes();
    }
  }, [episodes.length, loadEpisodes]);

  useEffect(() => {
    if (seasonEpisodes.length && (!selectedEpisode || selectedEpisode.season !== activeEpisodeSeason)) {
      selectEpisode(seasonEpisodes[0].id);
    }
  }, [activeEpisodeSeason, seasonEpisodes, selectEpisode, selectedEpisode]);

  const handleSeasonSelect = (season) => {
    setActiveEpisodeSeason(season);
    const firstEpisode = episodes.find((episode) => episode.season === season && episode.episode_number === 1);
    if (firstEpisode) {
      selectEpisode(firstEpisode.id);
    }
  };

  return (
    <section className="view episode-guide">
      <div className="eyebrow">Episodes / Read Only</div>
      <h1>Episode Guide</h1>
      <p className="dashboard-lede">Locked format: 3 seasons, 8 episodes each, 24 episodes total.</p>

      {episodes.length ? (
        <div className="episode-workspace">
          <div className="episode-list-panel">
            <div className="season-switcher" aria-label="Season selector">
              {seasons.map((season) => (
                <button
                  className={activeEpisodeSeason === season ? 'active' : ''}
                  key={season}
                  onClick={() => handleSeasonSelect(season)}
                  type="button"
                >
                  Season {season}
                </button>
              ))}
            </div>
            <div className="episode-card-grid">
              {seasonEpisodes.map((episode) => (
                <button
                  className={`episode-card ${String(selectedEpisode?.id) === String(episode.id) ? 'selected' : ''}`}
                  key={episode.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    selectEpisode(episode.id);
                  }}
                  type="button"
                >
                  <div className="episode-card-topline">
                    <span>S{episode.season}E{episode.episode_number}</span>
                    <StatusBadge status={episode.status} />
                  </div>
                  <strong>{episode.title || 'Untitled'}</strong>
                  <small>{episode.na_tradition || 'NA tradition pending'}</small>
                  <p>{episode.thematic_core || episode.arc_summary || 'Episode summary pending.'}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="episode-detail-panel">
            <EpisodeDetail episode={selectedEpisode} />
          </div>
        </div>
      ) : (
        <div className="placeholder-block">Episodes are loading. Phase 3A expects 24 seeded records.</div>
      )}
    </section>
  );
}
