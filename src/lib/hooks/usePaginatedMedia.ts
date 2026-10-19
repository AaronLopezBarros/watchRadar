'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { mediaKey } from '@/src/lib/api/tmdb/media';
import type { MediaItem } from '@/src/lib/api/tmdb/types';

type UsePaginatedMediaOptions = {
  initialItems: MediaItem[];
  initialPage: number;
  // eslint-disable-next-line no-unused-vars -- `page` names the parameter for documentation, TS function types require a name
  fetchPage: (page: number) => Promise<MediaItem[]>;
  startLoading?: boolean;
};

export const usePaginatedMedia = ({
  initialItems,
  initialPage,
  fetchPage,
  startLoading,
}: UsePaginatedMediaOptions) => {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(startLoading ?? false);
  const [error, setError] = useState(false);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(initialPage);
  const seenKeysRef = useRef(new Set(initialItems.map(mediaKey)));
  const hasStartedRef = useRef(false);
  // Once a page comes back with nothing new, the sentinel keeps re-triggering onIntersect
  // (see useInfiniteScroll's resetKey) every time it's still in view, which would otherwise
  // hammer fetchPage forever instead of stopping once the results are exhausted.
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

  // Search starts with no items and relies on this effect to fetch page 1 itself,
  // instead of waiting for the sentinel to intersect: on narrow viewports the initial
  // skeletons push the sentinel out of view, so it never intersects and loadNextPage never runs.
  useEffect(() => {
    if (!startLoading || hasStartedRef.current) return;

    hasStartedRef.current = true;
    loadNextPage();
  }, [startLoading, loadNextPage]);

  return { items, isLoading, error, loadNextPage };
};
