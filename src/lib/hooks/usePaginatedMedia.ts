'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { mediaKey } from '@/lib/api/tmdb/media';
import type { MediaItem } from '@/lib/api/tmdb/types';

type UsePaginatedMediaOptions = {
  initialItems: MediaItem[];
  initialPage: number;
  // eslint-disable-next-line no-unused-vars -- `page` names the parameter for documentation, TS function types require a name
  fetchPage: (page: number) => Promise<MediaItem[]>;
  startLoading?: boolean;
};

export function usePaginatedMedia({ initialItems, initialPage, fetchPage, startLoading }: UsePaginatedMediaOptions) {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(startLoading ?? false);
  const [error, setError] = useState(false);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(initialPage);
  const seenKeysRef = useRef(new Set(initialItems.map(mediaKey)));
  const hasStartedRef = useRef(false);
  // The sentinel keeps re-triggering onIntersect while it's in view, so without this an exhausted list would call
  // fetchPage forever.
  const hasMoreRef = useRef(true);

  const loadNextPage = useCallback(async () => {
    if (isLoadingRef.current || !hasMoreRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(false);

    try {
      const nextPage = pageRef.current + 1;
      const newItems = await fetchPage(nextPage);
      const unique = newItems.filter(item => !seenKeysRef.current.has(mediaKey(item)));

      if (unique.length === 0) {
        hasMoreRef.current = false;
      } else {
        unique.forEach(item => seenKeysRef.current.add(mediaKey(item)));
        setItems(prev => [...prev, ...unique]);
        pageRef.current = nextPage;
      }
    } catch {
      setError(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchPage]);

  // Search fetches page 1 here instead of waiting for the sentinel: on narrow viewports the initial skeletons push it
  // out of view, so it would never intersect.
  useEffect(() => {
    if (!startLoading || hasStartedRef.current) return;

    hasStartedRef.current = true;
    loadNextPage();
  }, [startLoading, loadNextPage]);

  return { items, isLoading, error, loadNextPage };
}
