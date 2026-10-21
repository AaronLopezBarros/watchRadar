import { describe, expect, it } from 'vitest';

import { MAX_PROVIDERS, getStreamingProviders } from '@/lib/api/tmdb/providers';
import { createProvider } from '@/tests/factories/media.factory';

describe('getStreamingProviders', () => {
  it('returns the subscription providers for Spain', () => {
    const netflix = createProvider({ provider_name: 'Netflix' });

    expect(
      getStreamingProviders({ id: 1, results: { ES: { link: '', flatrate: [netflix] }, US: { link: '' } } }),
    ).toEqual([netflix]);
  });

  it('caps the list of providers', () => {
    const flatrate = Array.from({ length: MAX_PROVIDERS + 2 }, (_, index) => createProvider({ provider_id: index }));

    expect(getStreamingProviders({ id: 1, results: { ES: { link: '', flatrate } } })).toHaveLength(MAX_PROVIDERS);
  });

  it('returns an empty list when Spain has no subscription providers', () => {
    expect(getStreamingProviders({ id: 1, results: {} })).toEqual([]);
  });
});
