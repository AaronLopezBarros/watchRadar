'use client';

import { useCallback, useRef, useState } from 'react';

import { fetchMovieWatchProviders } from '@/lib/api/tmdb/actions';
import { getStreamingProviders } from '@/lib/api/tmdb/providers';
import type { WatchProvider } from '@/lib/api/tmdb/types';

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
      setProviders(getStreamingProviders(await fetchMovieWatchProviders(movieId)));
    } catch {
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, [movieId]);

  return { providers, isLoading, fetchProviders };
}
