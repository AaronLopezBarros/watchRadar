'use client';

import { useCallback, useRef, useState } from 'react';

import { fetchMovieWatchProviders } from '@/lib/api/tmdb/actions';
import type { WatchProvider } from '@/lib/api/tmdb/types';

const COUNTRY = 'ES';
const MAX_PROVIDERS = 6;

type UseWatchProvidersResult = {
  providers: WatchProvider[];
  isLoading: boolean;
  fetchProviders: () => void;
};

export const useWatchProviders = (movieId: number): UseWatchProvidersResult => {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fetched = useRef(false);

  const fetchProviders = useCallback(async () => {
    if (fetched.current) return;
    fetched.current = true;
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
  }, [movieId]);

  return { providers, isLoading, fetchProviders };
}
