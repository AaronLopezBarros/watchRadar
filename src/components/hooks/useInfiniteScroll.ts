'use client';

import { useEffect, type RefObject } from 'react';

type UseInfiniteScrollOptions = {
  onIntersect: () => void;
  rootMargin?: string;
  // IntersectionObserver only fires when the intersection ratio changes, so if the
  // sentinel is still visible after new content is appended it won't refire on its own.
  // Passing a value that changes with new content recreates the observer, which
  // re-checks the sentinel's current position and triggers loading again.
  resetKey?: unknown;
};

export const useInfiniteScroll = (
  sentinelRef: RefObject<HTMLDivElement | null>,
  { onIntersect, rootMargin, resetKey }: UseInfiniteScrollOptions,
) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onIntersect();
      },
      { rootMargin },
    );

    observer.observe(sentinelRef.current!);

    return () => observer.disconnect();
  }, [onIntersect, rootMargin, sentinelRef, resetKey]);
};
