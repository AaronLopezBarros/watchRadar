'use client';

import { useRef } from 'react';

import { PosterCard } from '@/src/components/PosterCard/PosterCard';
import { PosterCardSkeleton } from '@/src/components/PosterCard/PosterCardSkeleton';
import { useInfiniteScroll } from '@/src/components/PosterGrid/hooks/useInfiniteScroll';
import { mediaKey } from '@/src/lib/api/tmdb/media';
import type { MediaItem } from '@/src/lib/api/tmdb/types';

const SKELETON_COUNT = 20;
const LOAD_MARGIN = 300;
const PRIORITY_COUNT = 1;

type PosterGridProps = {
  items: MediaItem[];
  isLoading: boolean;
  onIntersect: () => void;
};

export function PosterGrid({ items, isLoading, onIntersect }: PosterGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useInfiniteScroll(sentinelRef, {
    onIntersect,
    rootMargin: `${LOAD_MARGIN}px`,
    resetKey: items.length,
  });

  return (
    <div className='grid grid-cols-3 gap-4 px-3 py-10 max-[380px]:gap-3 max-[380px]:px-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 sm:px-5'>
      {items.map((item, index) => (
        <PosterCard key={mediaKey(item)} item={item} priority={index < PRIORITY_COUNT} />
      ))}
      {isLoading && Array.from({ length: SKELETON_COUNT }, (_, index) => <PosterCardSkeleton key={index} />)}
      <div ref={sentinelRef} className='col-span-3 sm:w-full' />
    </div>
  );
}
