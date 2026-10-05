import { describe, expect, it } from 'vitest';

import { buildHomeHref, parseHomeSearchParams } from '@/src/lib/utils';

describe('utils: buildHomeHref', () => {
  it('returns the root for popular without filters', () => {
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

  it('adds streaming for categories that support it', () => {
    expect(buildHomeHref({ category: 'top_rated', genre: 'horror', streaming: true })).toBe(
      '/?category=top_rated&genre=horror&streaming=1',
    );
  });

  it('drops streaming for cinema categories', () => {
    expect(buildHomeHref({ category: 'now_playing', genre: 'horror', streaming: true })).toBe(
      '/?category=now_playing&genre=horror',
    );
  });
});

describe('utils: parseHomeSearchParams', () => {
  it('defaults to popular without filters', () => {
    expect(parseHomeSearchParams({})).toEqual({ category: 'popular', filters: { genre: undefined, streaming: false } });
  });

  it('reads a valid category, genre and streaming flag', () => {
    expect(parseHomeSearchParams({ category: 'top_rated', genre: 'horror', streaming: '1' })).toEqual({
      category: 'top_rated',
      filters: { genre: 'horror', streaming: true },
    });
  });

  it('falls back on unknown values', () => {
    expect(parseHomeSearchParams({ category: 'trending', genre: 'western', streaming: 'yes' })).toEqual({
      category: 'popular',
      filters: { genre: undefined, streaming: false },
    });
  });

  it('ignores streaming on cinema categories', () => {
    expect(parseHomeSearchParams({ category: 'now_playing', streaming: '1' }).filters.streaming).toBe(false);
  });

  it('reads back what buildHomeHref writes', () => {
    const href = buildHomeHref({ category: 'top_rated', genre: 'science_fiction', streaming: true });
    const params = Object.fromEntries(new URL(href, 'http://localhost').searchParams);

    expect(parseHomeSearchParams(params)).toEqual({
      category: 'top_rated',
      filters: { genre: 'science_fiction', streaming: true },
    });
  });
});
