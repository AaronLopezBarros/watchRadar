import { describe, expect, it } from 'vitest';

import { getDiscoverParams, hasFilters } from '@/lib/api/tmdb/discover';

const TODAY = new Date('2026-10-05T12:00:00Z');

describe('hasFilters', () => {
  it('is false when no filter is set', () => {
    expect(hasFilters({})).toBe(false);
    expect(hasFilters({ streaming: false })).toBe(false);
  });

  it('is true when a genre or streaming is set', () => {
    expect(hasFilters({ genre: 'horror' })).toBe(true);
    expect(hasFilters({ streaming: true })).toBe(true);
  });
});

describe('getDiscoverParams', () => {
  it('adds only the genre for popular, which is the discover default order', () => {
    expect(getDiscoverParams('popular', { genre: 'horror' }, TODAY)).toEqual({ with_genres: 27 });
  });

  it('sorts top_rated by rating with a minimum vote count', () => {
    expect(getDiscoverParams('top_rated', { genre: 'horror' }, TODAY)).toEqual({
      sort_by: 'vote_average.desc',
      'vote_count.gte': 300,
      with_genres: 27,
    });
  });

  it('limits now_playing to theatrical releases from the last six weeks up to today', () => {
    expect(getDiscoverParams('now_playing', { genre: 'horror' }, TODAY)).toEqual({
      with_release_type: '2|3',
      'release_date.gte': '2026-08-24',
      'release_date.lte': '2026-10-05',
      with_genres: 27,
    });
  });

  it('limits upcoming to theatrical releases from tomorrow to six weeks ahead', () => {
    expect(getDiscoverParams('upcoming', { genre: 'horror' }, TODAY)).toEqual({
      with_release_type: '2|3',
      'release_date.gte': '2026-10-06',
      'release_date.lte': '2026-11-16',
      with_genres: 27,
    });
  });

  it('restricts to subscription streaming in the watch region', () => {
    expect(getDiscoverParams('popular', { streaming: true }, TODAY)).toEqual({
      watch_region: 'ES',
      with_watch_monetization_types: 'flatrate',
    });
  });
});
