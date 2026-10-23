'use client';

import { useCallback, useRef, useState } from 'react';

import { fetchStreamingProviders } from '@/lib/api/tmdb/actions';
import type { MediaType, WatchProvider } from '@/lib/api/tmdb/types';

type UseWatchProvidersResult = {
  providers: WatchProvider[];
  isLoading: boolean;
  fetchProviders: () => void;
};

export function useWatchProviders(mediaType: MediaType, id: number): UseWatchProvidersResult {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedRef = useRef(false);

  const fetchProviders = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setIsLoading(true);
    try {
      setProviders(await fetchStreamingProviders(mediaType, id));
    } catch {
      setProviders([]);
    } finally {
      setIsLoading(false);
    }
  }, [mediaType, id]);

  return { providers, isLoading, fetchProviders };
}
