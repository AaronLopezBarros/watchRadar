import type { WatchProvider, WatchProvidersResponse } from '@/lib/api/tmdb/types';

export const MAX_PROVIDERS = 6;

export const getStreamingProviders = (response: WatchProvidersResponse, region: string): WatchProvider[] =>
  (response.results?.[region]?.flatrate ?? []).slice(0, MAX_PROVIDERS);
