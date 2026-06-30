import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovieWatchProviders, fetchPopularMovies } from '@/lib/api/tmdb/actions';
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

  describe('fetchPopularMovies', () => {
    it('calls tmdbClient with the correct endpoint and page', async () => {
      const movies = [{ id: 1 }, { id: 2 }];
      vi.mocked(tmdbClient).mockResolvedValue({ results: movies });

      const result = await fetchPopularMovies(3);

      expect(tmdbClient).toHaveBeenCalledWith('/movie/popular', { params: { page: 3 } });
      expect(result).toEqual(movies);
    });
  });
});
