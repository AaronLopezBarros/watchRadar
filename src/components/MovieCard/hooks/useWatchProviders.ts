'use client';

import { useEffect, useRef, useState } from 'react';

import { fetchMovieWatchProviders } from '@/src/app/actions';
import type { WatchProvider } from '@/src/lib/api/tmdb/types';

const COUNTRY = 'ES';
const MAX_PROVIDERS = 6;

type UseWatchProvidersResult = {
  providers: WatchProvider[];
  isLoading: boolean;
};

export function useWatchProviders(movieId: number, enabled: boolean): UseWatchProvidersResult {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (!enabled || fetched.current) return;

    fetched.current = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await fetchMovieWatchProviders(movieId);
        const flatrate = data.results?.[COUNTRY]?.flatrate ?? [];
        setProviders(flatrate.slice(0, MAX_PROVIDERS));
      } catch {
        setProviders([]);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [enabled, movieId]);

  return { providers, isLoading };
}
