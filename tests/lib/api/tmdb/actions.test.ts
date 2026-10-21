import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMediaDetails, fetchWatchProviders, fetchMedia, searchMedia } from '@/lib/api/tmdb/actions';
import { tmdbClient } from '@/lib/api/tmdb/client';
import { GENRES_REVALIDATE_SECONDS, SEARCH_REVALIDATE_SECONDS } from '@/lib/api/tmdb/constants';
import type { Genre } from '@/lib/api/tmdb/types';

vi.mock('@/lib/api/tmdb/client');

const GENRES_ENDPOINT = '/genre/movie/list';

// Lists also request the genre list, so answer each endpoint with its own payload.
const mockTmdb = ({ results = [], genres = [] }: { results?: object[]; genres?: Genre[] }) => {
  vi.mocked(tmdbClient).mockImplementation(async endpoint => (endpoint === GENRES_ENDPOINT ? { genres } : { results }));
};

describe('actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('fetchWatchProviders', () => {
    it('calls tmdbClient with the correct endpoint', async () => {
      const response = { id: 42, results: {} };
      vi.mocked(tmdbClient).mockResolvedValue(response);

      const result = await fetchWatchProviders('movie', 42);

      expect(tmdbClient).toHaveBeenCalledWith('/movie/42/watch/providers');
      expect(result).toEqual(response);
    });

    it.each([
      ['an unknown media type', 'person', 42],
      ['a non-integer id', 'movie', 1.5],
      ['a non-positive id', 'movie', 0],
    ])('rejects %s without calling TMDB', async (_case, mediaType, id) => {
      await expect(fetchWatchProviders(mediaType as 'movie', id)).rejects.toThrow();

      expect(tmdbClient).not.toHaveBeenCalled();
    });
  });

  describe('fetchMediaDetails', () => {
    it('calls tmdbClient with the movie endpoint and the locale language', async () => {
      const genres = [{ id: 878, name: 'Ciencia ficción' }];
      vi.mocked(tmdbClient).mockResolvedValue({ id: 27205, title: 'Origen', genres });

      const result = await fetchMediaDetails('movie', 27205, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/27205', { params: { language: 'es-ES' } });
      expect(result).toEqual({ mediaType: 'movie', id: 27205, title: 'Origen', genres });
    });

    it.each([
      ['an unknown media type', 'person', 27205],
      ['a non-integer id', 'movie', 1.5],
      ['a non-positive id', 'movie', 0],
    ])('rejects %s without calling TMDB', async (_case, mediaType, id) => {
      await expect(fetchMediaDetails(mediaType as 'movie', id, 'es')).rejects.toThrow();

      expect(tmdbClient).not.toHaveBeenCalled();
    });
  });

  describe('fetchMedia', () => {
    it('calls tmdbClient with the correct endpoint, page and language', async () => {
      mockTmdb({
        results: [
          { id: 1, genre_ids: [] },
          { id: 2, genre_ids: [] },
        ],
      });

      const result = await fetchMedia('movie', 'popular', 3, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 3, language: 'en-US' } });
      expect(result).toEqual([
        { mediaType: 'movie', id: 1, genres: [] },
        { mediaType: 'movie', id: 2, genres: [] },
      ]);
    });

    it('calls tmdbClient with the category-specific endpoint', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      const result = await fetchMedia('movie', 'top_rated', 1, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1, language: 'en-US' } });
      expect(result).toEqual([{ mediaType: 'movie', id: 1, genres: [] }]);
    });

    it('maps the es locale to the es-ES TMDB language', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      await fetchMedia('movie', 'popular', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 1, language: 'es-ES' } });
    });

    it('names each movie genre from the genre list in the locale language, cached for a day', async () => {
      mockTmdb({
        results: [{ id: 1, genre_ids: [878, 28] }],
        genres: [
          { id: 28, name: 'Acción' },
          { id: 878, name: 'Ciencia ficción' },
        ],
      });

      const result = await fetchMedia('movie', 'popular', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith(GENRES_ENDPOINT, {
        params: { language: 'es-ES' },
        revalidate: GENRES_REVALIDATE_SECONDS,
      });
      expect(result).toEqual([
        {
          mediaType: 'movie',
          id: 1,
          genres: [
            { id: 878, name: 'Ciencia ficción' },
            { id: 28, name: 'Acción' },
          ],
        },
      ]);
    });

    it('leaves out genres missing from the genre list', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [28, 99999] }], genres: [{ id: 28, name: 'Action' }] });

      const result = await fetchMedia('movie', 'popular', 1, 'en');

      expect(result).toEqual([{ mediaType: 'movie', id: 1, genres: [{ id: 28, name: 'Action' }] }]);
    });

    it('still returns the movies, without genres, when the genre list fails', async () => {
      vi.mocked(tmdbClient).mockImplementation(async endpoint => {
        if (endpoint === GENRES_ENDPOINT) throw new Error('TMDB down');
        return { results: [{ id: 1, genre_ids: [28] }] };
      });

      const result = await fetchMedia('movie', 'popular', 1, 'en');

      expect(result).toEqual([{ mediaType: 'movie', id: 1, genres: [] }]);
    });

    it('queries /discover/movie with the category-equivalent params when a genre is given', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-05T12:00:00Z') });
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      const result = await fetchMedia('movie', 'upcoming', 2, 'es', { genre: 'horror' });

      expect(tmdbClient).toHaveBeenCalledWith('/discover/movie', {
        params: {
          page: 2,
          language: 'es-ES',
          with_release_type: '2|3',
          'release_date.gte': '2026-10-06',
          'release_date.lte': '2026-11-16',
          with_genres: 27,
          include_adult: false,
        },
      });
      expect(result).toEqual([{ mediaType: 'movie', id: 1, genres: [] }]);
    });

    it('queries /discover/movie restricted to subscription streaming when streaming is on', async () => {
      mockTmdb({});

      await fetchMedia('movie', 'popular', 1, 'es', { streaming: true });

      expect(tmdbClient).toHaveBeenCalledWith('/discover/movie', {
        params: {
          page: 1,
          language: 'es-ES',
          watch_region: 'ES',
          with_watch_monetization_types: 'flatrate',
          include_adult: false,
        },
      });
    });

    it.each([
      ['an unknown media type', 'person', 'popular', {}],
      ['a category the media type does not have', 'movie', '../search', {}],
      ['an unknown genre', 'movie', 'popular', { genre: 'constructor' }],
    ])('rejects %s without calling TMDB', async (_case, mediaType, category, filters) => {
      await expect(
        fetchMedia(mediaType as 'movie', category as 'popular', 1, 'en', filters as object),
      ).rejects.toThrow();

      expect(tmdbClient).not.toHaveBeenCalled();
    });

    it('keeps the category endpoint when no filter is active', async () => {
      mockTmdb({});

      await fetchMedia('movie', 'top_rated', 1, 'en', { streaming: false });

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1, language: 'en-US' } });
    });
  });

  describe('searchMedia', () => {
    it('rejects an unknown media type without calling TMDB', async () => {
      await expect(searchMedia('person' as 'movie', 'batman', 1, 'en')).rejects.toThrow();

      expect(tmdbClient).not.toHaveBeenCalled();
    });

    it('calls tmdbClient with the query, page, language and revalidate window', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      const result = await searchMedia('movie', 'batman', 2, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 2, include_adult: false, language: 'en-US' },
        revalidate: SEARCH_REVALIDATE_SECONDS,
      });
      expect(result).toEqual([{ mediaType: 'movie', id: 1, genres: [] }]);
    });

    it('maps the es locale to the es-ES TMDB language', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      await searchMedia('movie', 'batman', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 1, include_adult: false, language: 'es-ES' },
        revalidate: SEARCH_REVALIDATE_SECONDS,
      });
    });

    it('names each result genre from the genre list', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [28] }], genres: [{ id: 28, name: 'Action' }] });

      const result = await searchMedia('movie', 'batman', 1, 'en');

      expect(result).toEqual([{ mediaType: 'movie', id: 1, genres: [{ id: 28, name: 'Action' }] }]);
    });
  });

  describe('series', () => {
    const TV_GENRES_ENDPOINT = '/genre/tv/list';
    const tmdbSeries = {
      adult: false,
      backdrop_path: null,
      first_air_date: '2011-04-17',
      genre_ids: [18],
      id: 1399,
      name: 'Juego de tronos',
      original_language: 'en',
      original_name: 'Game of Thrones',
      overview: '',
      popularity: 300,
      poster_path: '/got.jpg',
      vote_average: 8.5,
      vote_count: 25000,
    };

    beforeEach(() => {
      vi.mocked(tmdbClient).mockImplementation(async endpoint =>
        endpoint === TV_GENRES_ENDPOINT ? { genres: [{ id: 18, name: 'Drama' }] } : { results: [tmdbSeries] },
      );
    });

    it('lists every series category through /discover/tv, named with the series genre list', async () => {
      const result = await fetchMedia('tv', 'top_rated', 2, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/discover/tv', {
        params: {
          page: 2,
          language: 'es-ES',
          sort_by: 'vote_average.desc',
          'vote_count.gte': 200,
          without_genres: '10767,10763',
          include_adult: false,
        },
      });
      expect(tmdbClient).toHaveBeenCalledWith(TV_GENRES_ENDPOINT, {
        params: { language: 'es-ES' },
        revalidate: GENRES_REVALIDATE_SECONDS,
      });
      expect(result).toEqual([
        expect.objectContaining({
          mediaType: 'tv',
          id: 1399,
          title: 'Juego de tronos',
          original_title: 'Game of Thrones',
          release_date: '2011-04-17',
          genres: [{ id: 18, name: 'Drama' }],
        }),
      ]);
    });

    it('filters series by genre and streaming', async () => {
      await fetchMedia('tv', 'popular', 1, 'en', { genre: 'drama', streaming: true });

      expect(tmdbClient).toHaveBeenCalledWith('/discover/tv', {
        params: {
          page: 1,
          language: 'en-US',
          'vote_count.gte': 100,
          without_genres: '10767,10763',
          with_genres: 18,
          watch_region: 'ES',
          with_watch_monetization_types: 'flatrate',
          include_adult: false,
        },
      });
    });

    it('searches series in /search/tv', async () => {
      await searchMedia('tv', 'breaking bad', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/search/tv', {
        params: { query: 'breaking bad', page: 1, include_adult: false, language: 'es-ES' },
        revalidate: SEARCH_REVALIDATE_SECONDS,
      });
    });

    it('fetches the details of a series from /tv/{id}', async () => {
      vi.mocked(tmdbClient).mockResolvedValue({ ...tmdbSeries, genres: [{ id: 18, name: 'Drama' }] });

      const result = await fetchMediaDetails('tv', 1399, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/tv/1399', { params: { language: 'en-US' } });
      expect(result).toMatchObject({ mediaType: 'tv', title: 'Juego de tronos', genres: [{ id: 18, name: 'Drama' }] });
    });

    it('fetches the watch providers of a series from /tv/{id}/watch/providers', async () => {
      vi.mocked(tmdbClient).mockResolvedValue({ id: 1399, results: {} });

      await fetchWatchProviders('tv', 1399);

      expect(tmdbClient).toHaveBeenCalledWith('/tv/1399/watch/providers');
    });
  });
});
