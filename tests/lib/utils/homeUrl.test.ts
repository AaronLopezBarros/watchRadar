import { describe, expect, it } from 'vitest';

import { buildHomeHref, buildShareHref, parseHomeSearchParams, withMovieParam } from '@/src/lib/utils';

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

  it('reads a shared movie id', () => {
    expect(parseHomeSearchParams({ category: 'top_rated', movie: '27205' }).movieId).toBe(27205);
  });

  it.each(['abc', '-5', '0', '12.5', '27205abc', '../account'])('ignores the invalid movie id %s', movie => {
    expect(parseHomeSearchParams({ movie }).movieId).toBeUndefined();
  });

  it('reads the sharer language', () => {
    expect(parseHomeSearchParams({ movie: '27205', lang: 'es' }).sharedLocale).toBe('es');
  });

  it.each(['fr', 'ES', ''])('ignores the unsupported sharer language %s', lang => {
    expect(parseHomeSearchParams({ movie: '27205', lang }).sharedLocale).toBeUndefined();
  });

  it('reads back what buildShareHref writes', () => {
    const params = Object.fromEntries(new URL(buildShareHref(27205, 'es'), 'http://localhost').searchParams);

    expect(parseHomeSearchParams(params)).toMatchObject({ movieId: 27205, sharedLocale: 'es' });
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

describe('utils: withMovieParam', () => {
  it('adds the movie to the root', () => {
    expect(withMovieParam('', 27205)).toBe('/?movie=27205');
  });

  it('adds the movie keeping the category and filters', () => {
    expect(withMovieParam('?category=top_rated&genre=horror', 27205)).toBe(
      '/?category=top_rated&genre=horror&movie=27205',
    );
  });

  it('replaces a previous movie', () => {
    expect(withMovieParam('?movie=1&genre=horror', 2)).toBe('/?movie=2&genre=horror');
  });

  it('removes the movie keeping the rest', () => {
    expect(withMovieParam('?category=top_rated&movie=27205')).toBe('/?category=top_rated');
  });

  it('returns the root when the movie was the only param', () => {
    expect(withMovieParam('?movie=27205')).toBe('/');
  });

  it('drops the sharer language along with the movie', () => {
    expect(withMovieParam('?movie=27205&lang=es')).toBe('/');
  });
});

describe('utils: buildShareHref', () => {
  it('links to just the movie, in the sharer language', () => {
    expect(buildShareHref(27205, 'es')).toBe('/?movie=27205&lang=es');
  });
});
