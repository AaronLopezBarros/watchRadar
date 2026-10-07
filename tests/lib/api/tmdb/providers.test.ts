import { describe, expect, it } from 'vitest';

import { getStreamingProviders } from '@/lib/api/tmdb/providers';
import { createProvider } from '@/tests/factories/movie.factory';

describe('getStreamingProviders', () => {
  it('returns the subscription providers for Spain', () => {
    const netflix = createProvider({ provider_name: 'Netflix' });

    expect(
      getStreamingProviders({ id: 1, results: { ES: { link: '', flatrate: [netflix] }, US: { link: '' } } }),
    ).toEqual([netflix]);
  });

  it('caps the list at six providers', () => {
    const flatrate = Array.from({ length: 8 }, (_, index) => createProvider({ provider_id: index }));

    expect(getStreamingProviders({ id: 1, results: { ES: { link: '', flatrate } } })).toHaveLength(6);
  });

  it('returns an empty list when Spain has no subscription providers', () => {
    expect(getStreamingProviders({ id: 1, results: {} })).toEqual([]);
  });
});
