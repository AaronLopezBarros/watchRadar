import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tmdbClient } from '@/src/lib/api/tmdb/client';
import { getPopularMovies, getPopularMoviesMultiplePages } from '@/src/lib/api/tmdb/movies';
import { deduplicateById } from '@/src/lib/utils';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/client');
vi.mock('@/lib/utils');

describe('movies service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPopularMovies', () => {
    it('calls tmdbClient with the correct endpoint and params', async () => {
      const response = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0,
      };

      vi.mocked(tmdbClient).mockResolvedValue(response);

      const result = await getPopularMovies(2);

      expect(vi.mocked(tmdbClient)).toHaveBeenCalledWith('/movie/popular', {
        params: {
          page: 2,
        },
      });

      expect(result).toEqual(response);
    });
  });

  it('uses page 1 by default', async () => {
    vi.mocked(tmdbClient).mockResolvedValue({
      page: 1,
      results: [],
      total_pages: 1,
      total_results: 0,
    });

    await getPopularMovies();

    expect(vi.mocked(tmdbClient)).toHaveBeenCalledWith('/movie/popular', {
      params: {
        page: 1,
      },
    });
  });

  describe('getPopularMoviesMultiplePages', () => {
    it('fetches all requested pages', async () => {
      const movie1 = createMovie({ id: 1 });
      const movie2 = createMovie({ id: 2 });
      const movie3 = createMovie({ id: 3 });

      vi.mocked(tmdbClient).mockResolvedValue({
        results: [movie1, movie2],
      });

      vi.mocked(deduplicateById).mockReturnValue([movie1, movie2, movie3]);

      const result = await getPopularMoviesMultiplePages(2);

      expect(result).toEqual([movie1, movie2, movie3]);
    });
  });
});
