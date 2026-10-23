import { describe, expect, it } from 'vitest';

import { getDiscoverParams, hasFilters } from '@/lib/api/tmdb/discover';
import { MEDIA_CATEGORIES } from '@/lib/api/tmdb/media';

const CONTEXT = { today: new Date('2026-10-05T12:00:00Z'), region: 'MX' };

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
    expect(getDiscoverParams('movie', 'popular', { genre: 'horror' }, CONTEXT)).toEqual({ with_genres: 27 });
  });

  it('sorts top_rated by rating with a minimum vote count', () => {
    expect(getDiscoverParams('movie', 'top_rated', { genre: 'horror' }, CONTEXT)).toEqual({
      sort_by: 'vote_average.desc',
      'vote_count.gte': 300,
      with_genres: 27,
    });
  });

  it('limits now_playing to theatrical releases in the region from the last six weeks up to today', () => {
    expect(getDiscoverParams('movie', 'now_playing', { genre: 'horror' }, CONTEXT)).toEqual({
      region: 'MX',
      with_release_type: '2|3',
      'release_date.gte': '2026-08-24',
      'release_date.lte': '2026-10-05',
      with_genres: 27,
    });
  });

  it('limits upcoming to theatrical releases in the region from tomorrow to six weeks ahead', () => {
    expect(getDiscoverParams('movie', 'upcoming', { genre: 'horror' }, CONTEXT)).toEqual({
      region: 'MX',
      with_release_type: '2|3',
      'release_date.gte': '2026-10-06',
      'release_date.lte': '2026-11-16',
      with_genres: 27,
    });
  });

  it('takes movies that premiered in the last three months for now_playing on streaming', () => {
    expect(getDiscoverParams('movie', 'now_playing', { streaming: true }, CONTEXT)).toEqual({
      'primary_release_date.gte': '2026-07-07',
      'primary_release_date.lte': '2026-10-05',
      watch_region: 'MX',
      with_watch_monetization_types: 'flatrate',
    });
  });

  it('restricts to subscription streaming in the watch region', () => {
    expect(getDiscoverParams('movie', 'popular', { streaming: true }, CONTEXT)).toEqual({
      watch_region: 'MX',
      with_watch_monetization_types: 'flatrate',
    });
  });
});

describe('getDiscoverParams for series', () => {
  const NO_TALK_OR_NEWS = { without_genres: '10767,10763' };

  it('keeps talk shows and news out of every series list', () => {
    MEDIA_CATEGORIES.forEach(category =>
      expect(getDiscoverParams('tv', category, {}, CONTEXT)).toMatchObject(NO_TALK_OR_NEWS),
    );
  });

  it('keeps obscure series out of popular with a minimum vote count', () => {
    expect(getDiscoverParams('tv', 'popular', {}, CONTEXT)).toEqual({ 'vote_count.gte': 100, ...NO_TALK_OR_NEWS });
  });

  it('sorts top_rated by rating with a series-sized minimum vote count', () => {
    expect(getDiscoverParams('tv', 'top_rated', {}, CONTEXT)).toEqual({
      sort_by: 'vote_average.desc',
      'vote_count.gte': 200,
      ...NO_TALK_OR_NEWS,
    });
  });

  it('limits now_playing to series that premiered in the last six weeks up to today', () => {
    expect(getDiscoverParams('tv', 'now_playing', {}, CONTEXT)).toEqual({
      'first_air_date.gte': '2026-08-24',
      'first_air_date.lte': '2026-10-05',
      ...NO_TALK_OR_NEWS,
    });
  });

  it('limits upcoming to series premiering from tomorrow to six weeks ahead', () => {
    expect(getDiscoverParams('tv', 'upcoming', {}, CONTEXT)).toEqual({
      'first_air_date.gte': '2026-10-06',
      'first_air_date.lte': '2026-11-16',
      ...NO_TALK_OR_NEWS,
    });
  });

  it('adds a series genre and streaming', () => {
    expect(getDiscoverParams('tv', 'popular', { genre: 'science_fiction', streaming: true }, CONTEXT)).toMatchObject({
      with_genres: 10765,
      watch_region: 'MX',
      with_watch_monetization_types: 'flatrate',
    });
  });
});
