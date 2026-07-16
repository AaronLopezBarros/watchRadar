import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovieWatchProviders, fetchMovies, searchMovies } from '@/lib/api/tmdb/actions';
import { tmdbClient } from '@/lib/api/tmdb/client';

vi.mock('@/lib/api/tmdb/client');

describe('actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
