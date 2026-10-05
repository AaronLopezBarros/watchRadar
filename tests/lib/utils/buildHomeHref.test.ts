import { describe, expect, it } from 'vitest';

import { buildHomeHref } from '@/src/lib/utils';

describe('utils: buildHomeHref', () => {
  it('returns the root for popular without a genre', () => {
    expect(buildHomeHref({ category: 'popular' })).toBe('/');
  });

  it('adds the category when it is not popular', () => {
    expect(buildHomeHref({ category: 'top_rated' })).toBe('/?category=top_rated');
  });

  it('adds only the genre for popular', () => {
    expect(buildHomeHref({ category: 'popular', genre: 'horror' })).toBe('/?genre=horror');
  });

  it('adds both the category and the genre', () => {
    expect(buildHomeHref({ category: 'upcoming', genre: 'science_fiction' })).toBe(
      '/?category=upcoming&genre=science_fiction',
    );
  });
});
