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
    it('calls tmdbClient with the correct endpoint and page', async () => {
      const movies = [{ id: 1 }, { id: 2 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await fetchMovies('popular', 3);

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 3 } });
      expect(result).toEqual(movies);
    });

    it('calls tmdbClient with the category-specific endpoint', async () => {
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await fetchMovies('top_rated', 1);

      expect(tmdbClient).toHaveBeenCalledWith('/movie/top_rated', { params: { page: 1 } });
      expect(result).toEqual(movies);
    });
  });

  describe('searchMovies', () => {
    it('calls tmdbClient with the query, page and revalidate window', async () => {
      const movies = [{ id: 1 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await searchMovies('batman', 2);

      expect(tmdbClient).toHaveBeenCalledWith('/search/movie', {
        params: { query: 'batman', page: 2, include_adult: false },
        revalidate: 60,
      });
      expect(result).toEqual(movies);
    });
  });
});
