import { describe, expect, it } from 'vitest';

import { buildHomeHref, buildShareHref, parseHomeSearchParams, withMediaParam } from '@/src/lib/utils';

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

  it('leaves the type out for movies, the default', () => {
    expect(buildHomeHref({ mediaType: 'movie', category: 'top_rated' })).toBe('/?category=top_rated');
  });

  it('adds the type for series', () => {
    expect(buildHomeHref({ mediaType: 'tv', category: 'popular' })).toBe('/?type=tv');
    expect(buildHomeHref({ mediaType: 'tv', category: 'now_playing' })).toBe('/?type=tv&category=now_playing');
  });

  it('drops streaming for upcoming, which nothing is streaming yet', () => {
    expect(buildHomeHref({ category: 'upcoming', genre: 'horror', streaming: true })).toBe(
      '/?category=upcoming&genre=horror',
    );
  });
});

describe('utils: parseHomeSearchParams', () => {
  it('defaults to popular without filters', () => {
    expect(parseHomeSearchParams({})).toEqual({
      mediaType: 'movie',
      category: 'popular',
      filters: { genre: undefined, streaming: false },
    });
  });

  it('reads a valid category, genre and streaming flag', () => {
    expect(parseHomeSearchParams({ category: 'top_rated', genre: 'horror', streaming: '1' })).toEqual({
      mediaType: 'movie',
      category: 'top_rated',
      filters: { genre: 'horror', streaming: true },
    });
  });

  it('falls back on unknown values', () => {
    expect(parseHomeSearchParams({ type: 'person', category: 'trending', genre: 'western', streaming: 'yes' })).toEqual(
      {
        mediaType: 'movie',
        category: 'popular',
        filters: { genre: undefined, streaming: false },
      },
    );
  });

  it('ignores streaming on upcoming', () => {
    expect(parseHomeSearchParams({ category: 'upcoming', streaming: '1' }).filters.streaming).toBe(false);
  });

  it('reads a shared movie', () => {
    expect(parseHomeSearchParams({ category: 'top_rated', movie: '27205' }).sharedMedia).toEqual({
      mediaType: 'movie',
      id: 27205,
    });
  });

  it('reads a shared series', () => {
    expect(parseHomeSearchParams({ type: 'tv', tv: '1399' }).sharedMedia).toEqual({ mediaType: 'tv', id: 1399 });
  });

  it('ignores a movie id on series, so it never opens the movie over the series grid', () => {
    expect(parseHomeSearchParams({ type: 'tv', movie: '1' }).sharedMedia).toBeUndefined();
  });

  it('ignores a series id without the series type', () => {
    expect(parseHomeSearchParams({ tv: '1399' }).sharedMedia).toBeUndefined();
  });

  it.each(['abc', '-5', '0', '12.5', '27205abc', '../account'])('ignores the invalid id %s', id => {
    expect(parseHomeSearchParams({ movie: id }).sharedMedia).toBeUndefined();
    expect(parseHomeSearchParams({ type: 'tv', tv: id }).sharedMedia).toBeUndefined();
  });

  it('reads the sharer language', () => {
    expect(parseHomeSearchParams({ movie: '27205', lang: 'es' }).sharedLocale).toBe('es');
  });

  it.each(['fr', 'ES', ''])('ignores the unsupported sharer language %s', lang => {
    expect(parseHomeSearchParams({ movie: '27205', lang }).sharedLocale).toBeUndefined();
  });

  it.each([
    { mediaType: 'movie', id: 27205 },
    { mediaType: 'tv', id: 1399 },
  ] as const)('reads back what buildShareHref writes for $mediaType', item => {
    const params = Object.fromEntries(new URL(buildShareHref(item, 'es'), 'http://localhost').searchParams);

    expect(parseHomeSearchParams(params)).toMatchObject({
      mediaType: item.mediaType,
      sharedMedia: item,
      sharedLocale: 'es',
    });
  });

  it('reads back what buildHomeHref writes', () => {
    const href = buildHomeHref({ category: 'top_rated', genre: 'science_fiction', streaming: true });
    const params = Object.fromEntries(new URL(href, 'http://localhost').searchParams);

    expect(parseHomeSearchParams(params)).toEqual({
      mediaType: 'movie',
      category: 'top_rated',
      filters: { genre: 'science_fiction', streaming: true },
    });
  });

  it('reads series with the shared categories', () => {
    expect(parseHomeSearchParams({ type: 'tv', category: 'now_playing' })).toMatchObject({
      mediaType: 'tv',
      category: 'now_playing',
    });
  });

  it('reads a series genre and streaming', () => {
    expect(parseHomeSearchParams({ type: 'tv', genre: 'science_fiction', streaming: '1' }).filters).toEqual({
      genre: 'science_fiction',
      streaming: true,
    });
  });

  it('drops a movie genre on series', () => {
    expect(parseHomeSearchParams({ type: 'tv', genre: 'horror' }).filters.genre).toBeUndefined();
  });

  it('reads back what buildHomeHref writes for series', () => {
    const href = buildHomeHref({ mediaType: 'tv', category: 'upcoming' });
    const params = Object.fromEntries(new URL(href, 'http://localhost').searchParams);

    expect(parseHomeSearchParams(params)).toMatchObject({ mediaType: 'tv', category: 'upcoming' });
  });
});

describe('utils: withMediaParam', () => {
  const movie = { mediaType: 'movie', id: 27205 } as const;
  const series = { mediaType: 'tv', id: 1399 } as const;

  it('adds the movie to the root', () => {
    expect(withMediaParam('', movie)).toBe('/?movie=27205');
  });

  it('adds the movie keeping the category and filters', () => {
    expect(withMediaParam('?category=top_rated&genre=horror', movie)).toBe(
      '/?category=top_rated&genre=horror&movie=27205',
    );
  });

  it('replaces a previous movie', () => {
    expect(withMediaParam('?movie=1&genre=horror', { mediaType: 'movie', id: 2 })).toBe('/?genre=horror&movie=2');
  });

  it('adds a series under its own param, keeping the type', () => {
    expect(withMediaParam('?type=tv&category=top_rated', series)).toBe('/?type=tv&category=top_rated&tv=1399');
  });

  it('removes the series keeping the type', () => {
    expect(withMediaParam('?type=tv&tv=1399&lang=es')).toBe('/?type=tv');
  });

  it('removes the movie keeping the rest', () => {
    expect(withMediaParam('?category=top_rated&movie=27205')).toBe('/?category=top_rated');
  });

  it('returns the root when the movie was the only param', () => {
    expect(withMediaParam('?movie=27205')).toBe('/');
  });

  it('drops the sharer language along with the movie', () => {
    expect(withMediaParam('?movie=27205&lang=es')).toBe('/');
  });
});

describe('utils: buildShareHref', () => {
  it('links to just the movie, in the sharer language', () => {
    expect(buildShareHref({ mediaType: 'movie', id: 27205 }, 'es')).toBe('/?movie=27205&lang=es');
  });

  it('links to just the series, over the series grid', () => {
    expect(buildShareHref({ mediaType: 'tv', id: 1399 }, 'es')).toBe('/?type=tv&tv=1399&lang=es');
  });
});
