import { useEffect, useMemo } from 'react';
import { useRevivalStore } from '../store.js';
import CanonTagBadges from './CanonTagBadges.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function OutbreakTimeline() {
  const activeTimelineEventId = useRevivalStore((state) => state.activeTimelineEventId);
  const timelineEvents = useRevivalStore((state) => state.timelineEvents);
  const entityTagsByKey = useRevivalStore((state) => state.entityTagsByKey);
  const loadTimelineEvents = useRevivalStore((state) => state.loadTimelineEvents);
  const selectTimelineEvent = useRevivalStore((state) => state.selectTimelineEvent);
  const groupedEvents = useMemo(() => groupByBucket(timelineEvents), [timelineEvents]);

  useEffect(() => {
    if (!timelineEvents.length) {
      loadTimelineEvents();
    }
  }, [loadTimelineEvents, timelineEvents.length]);

  useEffect(() => {
    if (!activeTimelineEventId && timelineEvents.length) {
      selectTimelineEvent(timelineEvents[0].id);
    }
  }, [activeTimelineEventId, selectTimelineEvent, timelineEvents]);

  return (
    <section className="view timeline-view">
      <div className="eyebrow">Outbreak Timeline / Read Only</div>
      <h1>Outbreak Timeline</h1>
      <p className="dashboard-lede">Phase 5A starter chronology for high-level outbreak anchors. Exact dates and full phase ranges remain deferred.</p>

      {timelineEvents.length ? (
        <div className="timeline-event-list">
          {groupedEvents.map(([bucket, events]) => (
            <section className="timeline-bucket" key={bucket}>
              <h2>{bucket}</h2>
              <div className="timeline-bucket-list">
                {events.map((event) => (
                  <button
                    className={`timeline-event-card ${String(activeTimelineEventId) === String(event.id) ? 'selected' : ''}`}
                    key={event.id}
                    onClick={() => selectTimelineEvent(event.id)}
                    type="button"
                  >
                    <div className="timeline-card-topline">
                      <span>{formatEpisodeLabel(event)}</span>
                      <StatusBadge status={event.status} />
                    </div>
                    <strong>{event.title}</strong>
                    <CanonTagBadges tags={entityTagsByKey[`timeline_event:${event.id}`] || []} />
                    <p>{event.summary || 'Summary pending.'}</p>
                    <dl className="timeline-metadata">
                      <div>
                        <dt>Phase</dt>
                        <dd>{event.outbreak_phase}</dd>
                      </div>
                      <div>
                        <dt>Type</dt>
                        <dd>{formatLabel(event.event_type)}</dd>
                      </div>
                      <div>
                        <dt>Source</dt>
                        <dd>{event.source_note || 'Source pending.'}</dd>
                      </div>
                    </dl>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="placeholder-block">Timeline events are loading. Phase 5A expects a small starter set.</div>
      )}
    </section>
  );
}

function groupByBucket(events) {
  const groups = new Map();
  for (const event of events) {
    if (!groups.has(event.chronology_bucket)) {
      groups.set(event.chronology_bucket, []);
    }
    groups.get(event.chronology_bucket).push(event);
  }

  return [...groups.entries()];
}

function formatEpisodeLabel(event) {
  if (event.season && event.episode_number) {
    return `S${event.season}E${event.episode_number}`;
  }

  if (event.season) {
    return `Season ${event.season}`;
  }

  return event.chronology_bucket;
}

function formatLabel(value) {
  return String(value || '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
