import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovieDetails, fetchMovieWatchProviders, fetchMovies, searchMovies } from '@/lib/api/tmdb/actions';
import { tmdbClient } from '@/lib/api/tmdb/client';
import type { Genre } from '@/lib/api/tmdb/types';

vi.mock('@/lib/api/tmdb/client');

const GENRES_ENDPOINT = '/genre/movie/list';

// Movie lists also request the genre list, so answer each endpoint with its own payload.
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

  describe('fetchMovieWatchProviders', () => {
    it('calls tmdbClient with the correct endpoint', async () => {
      const response = { id: 42, results: {} };
      vi.mocked(tmdbClient).mockResolvedValue(response);

      const result = await fetchMovieWatchProviders(42);

      expect(tmdbClient).toHaveBeenCalledWith('/movie/42/watch/providers');
      expect(result).toEqual(response);
    });
  });

  describe('fetchMovieDetails', () => {
    it('calls tmdbClient with the movie endpoint and the locale language', async () => {
      const movie = { id: 27205, title: 'Origen' };
      vi.mocked(tmdbClient).mockResolvedValue(movie);

      const result = await fetchMovieDetails(27205, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/27205', { params: { language: 'es-ES' } });
      expect(result).toEqual(movie);
    });
  });

  describe('fetchMovies', () => {
    it('calls tmdbClient with the correct endpoint, page and language', async () => {
      mockTmdb({
        results: [
          { id: 1, genre_ids: [] },
          { id: 2, genre_ids: [] },
        ],
      });

      const result = await fetchMovies('popular', 3, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 3, language: 'en-US' } });
      expect(result).toEqual([
        { id: 1, genres: [] },
        { id: 2, genres: [] },
      ]);
    });

    it('calls tmdbClient with the category-specific endpoint', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      const result = await fetchMovies('top_rated', 1, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1, language: 'en-US' } });
      expect(result).toEqual([{ id: 1, genres: [] }]);
    });

    it('maps the es locale to the es-ES TMDB language', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      await fetchMovies('popular', 1, 'es');

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

      const result = await fetchMovies('popular', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith(GENRES_ENDPOINT, { params: { language: 'es-ES' }, revalidate: 86400 });
      expect(result).toEqual([
        {
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

      const result = await fetchMovies('popular', 1, 'en');

      expect(result).toEqual([{ id: 1, genres: [{ id: 28, name: 'Action' }] }]);
    });

    it('still returns the movies, without genres, when the genre list fails', async () => {
      vi.mocked(tmdbClient).mockImplementation(async endpoint => {
        if (endpoint === GENRES_ENDPOINT) throw new Error('TMDB down');
        return { results: [{ id: 1, genre_ids: [28] }] };
      });

      const result = await fetchMovies('popular', 1, 'en');

      expect(result).toEqual([{ id: 1, genres: [] }]);
    });

    it('queries /discover/movie with the category-equivalent params when a genre is given', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-05T12:00:00Z') });
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      const result = await fetchMovies('upcoming', 2, 'es', { genre: 'horror' });

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
      expect(result).toEqual([{ id: 1, genres: [] }]);
    });

    it('queries /discover/movie restricted to subscription streaming when streaming is on', async () => {
      mockTmdb({});

      await fetchMovies('popular', 1, 'es', { streaming: true });

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

    it('keeps the category endpoint when no filter is active', async () => {
      mockTmdb({});

      await fetchMovies('top_rated', 1, 'en', { streaming: false });

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1, language: 'en-US' } });
    });
  });

  describe('searchMovies', () => {
    it('calls tmdbClient with the query, page, language and revalidate window', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      const result = await searchMovies('batman', 2, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 2, include_adult: false, language: 'en-US' },
        revalidate: 60,
      });
      expect(result).toEqual([{ id: 1, genres: [] }]);
    });

    it('maps the es locale to the es-ES TMDB language', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [] }] });

      await searchMovies('batman', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 1, include_adult: false, language: 'es-ES' },
        revalidate: 60,
      });
    });

    it('names each result genre from the genre list', async () => {
      mockTmdb({ results: [{ id: 1, genre_ids: [28] }], genres: [{ id: 28, name: 'Action' }] });

      const result = await searchMovies('batman', 1, 'en');

      expect(result).toEqual([{ id: 1, genres: [{ id: 28, name: 'Action' }] }]);
    });
  });
});
