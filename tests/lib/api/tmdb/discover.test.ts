import { describe, expect, it } from 'vitest';

import { getDiscoverParams } from '@/lib/api/tmdb/discover';

const TODAY = new Date('2026-10-05T12:00:00Z');

describe('getDiscoverParams', () => {
  it('adds no params for popular, which is the discover default', () => {
    expect(getDiscoverParams('popular', TODAY)).toEqual({});
  });

  it('sorts top_rated by rating with a minimum vote count', () => {
    expect(getDiscoverParams('top_rated', TODAY)).toEqual({ sort_by: 'vote_average.desc', 'vote_count.gte': 300 });
  });

  it('limits now_playing to theatrical releases from the last six weeks up to today', () => {
    expect(getDiscoverParams('now_playing', TODAY)).toEqual({
      with_release_type: '2|3',
      'release_date.gte': '2026-08-24',
      'release_date.lte': '2026-10-05',
    });
  });

  it('limits upcoming to theatrical releases from tomorrow to six weeks ahead', () => {
    expect(getDiscoverParams('upcoming', TODAY)).toEqual({
      with_release_type: '2|3',
      'release_date.gte': '2026-10-06',
      'release_date.lte': '2026-11-16',
    });
  });
});
