import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovieDetails, fetchMovieWatchProviders, fetchMovies, searchMovies } from '@/lib/api/tmdb/actions';
import { tmdbClient } from '@/lib/api/tmdb/client';

vi.mock('@/lib/api/tmdb/client');

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
      const movies = [{ id: 1 }, { id: 2 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await fetchMovies('popular', 3, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 3, language: 'en-US' } });
      expect(result).toEqual(movies);
    });

    it('calls tmdbClient with the category-specific endpoint', async () => {
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await fetchMovies('top_rated', 1, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1, language: 'en-US' } });
      expect(result).toEqual(movies);
    });

    it('maps the es locale to the es-ES TMDB language', async () => {
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      await fetchMovies('popular', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 1, language: 'es-ES' } });
    });

    it('queries /discover/movie with the category-equivalent params when a genre is given', async () => {
      vi.useFakeTimers({ now: new Date('2026-10-05T12:00:00Z') });
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

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
      expect(result).toEqual(movies);
    });

    it('queries /discover/movie restricted to subscription streaming when streaming is on', async () => {
      vi.mocked(tmdbClient).mockResolvedValue({ results: [] });

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
      vi.mocked(tmdbClient).mockResolvedValue({ results: [] });

      await fetchMovies('top_rated', 1, 'en', { streaming: false });

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1, language: 'en-US' } });
    });
  });

  describe('searchMovies', () => {
    it('calls tmdbClient with the query, page, language and revalidate window', async () => {
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await searchMovies('batman', 2, 'en');

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 2, include_adult: false, language: 'en-US' },
        revalidate: 60,
      });
      expect(result).toEqual(movies);
    });

    it('maps the es locale to the es-ES TMDB language', async () => {
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      await searchMovies('batman', 1, 'es');

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 1, include_adult: false, language: 'es-ES' },
        revalidate: 60,
      });
    });
  });
});
