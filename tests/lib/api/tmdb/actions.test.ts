import { describe, expect, it, vi } from 'vitest';

import { fetchMovieWatchProviders } from '@/lib/api/tmdb/actions';
import { getMovieWatchProviders } from '@/lib/api/tmdb/movies';

vi.mock('@/lib/api/tmdb/movies');

describe('fetchMovieWatchProviders', () => {
  it('delegates to getMovieWatchProviders with the given movieId', async () => {
    const response = { id: 42, results: {} };
    vi.mocked(getMovieWatchProviders).mockResolvedValue(response);

    const result = await fetchMovieWatchProviders(42);

    expect(getMovieWatchProviders).toHaveBeenCalledWith(42);
    expect(result).toEqual(response);
  });
});
