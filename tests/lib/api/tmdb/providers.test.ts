import { describe, expect, it } from 'vitest';

import { MAX_PROVIDERS, getStreamingProviders } from '@/lib/api/tmdb/providers';
import { createProvider } from '@/tests/factories/media.factory';

describe('getStreamingProviders', () => {
  it('returns the subscription providers for the given region', () => {
    const netflix = createProvider({ provider_name: 'Netflix' });
    const max = createProvider({ provider_name: 'Max' });
    const response = { id: 1, results: { ES: { link: '', flatrate: [netflix] }, US: { link: '', flatrate: [max] } } };

    expect(getStreamingProviders(response, 'ES')).toEqual([netflix]);
    expect(getStreamingProviders(response, 'US')).toEqual([max]);
  });

  it('caps the list of providers', () => {
    const flatrate = Array.from({ length: MAX_PROVIDERS + 2 }, (_, index) => createProvider({ provider_id: index }));

    expect(getStreamingProviders({ id: 1, results: { ES: { link: '', flatrate } } }, 'ES')).toHaveLength(MAX_PROVIDERS);
  });

  it('returns an empty list when the region has no subscription providers', () => {
    expect(getStreamingProviders({ id: 1, results: { ES: { link: '' } } }, 'ES')).toEqual([]);
    expect(getStreamingProviders({ id: 1, results: {} }, 'ES')).toEqual([]);
  });
});
