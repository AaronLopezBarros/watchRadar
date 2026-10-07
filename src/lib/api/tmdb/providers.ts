import { TMDB_WATCH_REGION } from '@/lib/api/tmdb/constants';
import type { WatchProvider, WatchProvidersResponse } from '@/lib/api/tmdb/types';

const MAX_PROVIDERS = 6;

export const getStreamingProviders = (response: WatchProvidersResponse): WatchProvider[] =>
  (response.results?.[TMDB_WATCH_REGION]?.flatrate ?? []).slice(0, MAX_PROVIDERS);
