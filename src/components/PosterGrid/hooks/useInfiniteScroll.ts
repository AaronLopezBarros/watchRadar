'use client';

import { useEffect, type RefObject } from 'react';

type UseInfiniteScrollOptions = {
  onIntersect: () => void;
  rootMargin?: string;
  // IntersectionObserver doesn't refire while the sentinel stays visible after new content is appended; changing this
  // recreates the observer, which re-checks the sentinel and loads again.
  resetKey?: unknown;
};

export const useInfiniteScroll = (
  sentinelRef: RefObject<HTMLDivElement | null>,
  { onIntersect, rootMargin, resetKey }: UseInfiniteScrollOptions,
) => {
  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [onIntersect, rootMargin, sentinelRef, resetKey]);
};
