import { seedEpisodesIfNeeded } from './db.js';

const seasonThemes = {
  1: 'Diagnosis - what is already wrong.',
  2: 'Confrontation - what happens when it can no longer be ignored.',
  3: 'Consequence - what we build in the aftermath and whether it is any different.'
};

const episodeSeeds = [
  episode(1, 1, 1, 'First Things First', 'NA Slogan'),
  episode(2, 1, 2, 'Keep Coming Back', 'Meeting Close'),
  episode(3, 1, 3, 'How It Works', 'Basic Text Section'),
  episode(4, 1, 4, 'One Day at a Time', 'NA Slogan'),
  episode(5, 1, 5, 'Progress Not Perfection', 'NA Slogan'),
  episode(6, 1, 6, 'Let Go and Let God', 'NA Slogan'),
  episode(7, 1, 7, 'First Things First (Reprise)', 'NA Slogan'),
  episode(8, 1, 8, 'We Keep What We Have by Giving It Away', '12th Tradition'),
  episode(9, 2, 1, 'Keep It Simple', 'NA Slogan'),
  episode(10, 2, 2, 'Fake It Till You Make It', 'NA Slogan'),
  episode(11, 2, 3, 'Progress Not Perfection (Reprise)', 'NA Slogan'),
  episode(12, 2, 4, 'Let Go and Let God (Reprise)', 'NA Slogan'),
  episode(13, 2, 5, 'Easy Does It', 'NA Slogan'),
  episode(14, 2, 6, 'One Day at a Time (Reprise)', 'NA Slogan'),
  episode(15, 2, 7, 'To Thine Own Self Be True', '9th Step Prayer'),
  episode(16, 2, 8, 'We Are Not Saints', 'NA Basic Text'),
  episode(17, 3, 1, 'Acceptance', '3rd Step'),
  episode(18, 3, 2, 'Made a Decision', '3rd Step'),
  episode(19, 3, 3, 'Searching and Fearless', '4th Step'),
  episode(20, 3, 4, 'Humbly Asked', '7th Step'),
  episode(21, 3, 5, 'Continued to Take', '10th Step'),
  episode(22, 3, 6, 'Sought Through Prayer', '11th Step'),
  episode(23, 3, 7, 'Having Had', '12th Step Preamble'),
  episode(24, 3, 8, 'Tried to Carry This Message', '12th Step')
];

export function seedEpisodes() {
  return seedEpisodesIfNeeded(episodeSeeds);
}

function episode(id, season, episode_number, title, na_tradition) {
  return {
    id,
    season,
    episode_number,
    title,
    na_tradition,
    dual_meaning: `${title} carries an NA-language surface meaning and a story-structure meaning. Full dual meaning pending.`,
    arc_summary: 'Arc summary pending. This episode is seeded as part of the locked 24-episode structure.',
    thematic_core: seasonThemes[season],
    cold_open: 'Cold open pending.',
    acts: '[]',
    flanagan_moment: 'Flanagan moment pending.',
    rewatch_notes: 'Rewatch architecture pending.',
    status: 'developing'
  };
}
