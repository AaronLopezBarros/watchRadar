import { describe, expect, it, vi } from 'vitest';

import { fetchMovieWatchProviders } from '@/lib/api/tmdb/actions';
import { tmdbClient } from '@/lib/api/tmdb/client';

vi.mock('@/lib/api/tmdb/client');

describe('fetchMovieWatchProviders', () => {
  it('calls tmdbClient with the correct endpoint', async () => {
    const response = { id: 42, results: {} };
    vi.mocked(tmdbClient).mockResolvedValue(response);

    const result = await fetchMovieWatchProviders(42);

    expect(tmdbClient).toHaveBeenCalledWith('/movie/42/watch/providers');
    expect(result).toEqual(response);
  });
});
