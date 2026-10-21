'use client';

import { useRef } from 'react';

import { PosterCard } from '@/components/PosterCard/PosterCard';
import { PosterCardSkeleton } from '@/components/PosterCard/PosterCardSkeleton';
import { useInfiniteScroll } from '@/components/PosterGrid/hooks/useInfiniteScroll';
import { mediaKey } from '@/lib/api/tmdb/media';
import type { MediaItem } from '@/lib/api/tmdb/types';

const SKELETON_COUNT = 20;
const LOAD_MARGIN = 300;
const PRIORITY_COUNT = 1;
// Roughly the first screen enters in sequence; cards loaded later by scrolling enter right away.
export const STAGGER_COUNT = 12;
export const STAGGER_STEP_MS = 30;
const GRID_CLASS_NAME =
  'grid grid-cols-3 gap-4 px-3 py-10 max-[380px]:gap-3 max-[380px]:px-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 sm:px-5';

const renderSkeletons = () => Array.from({ length: SKELETON_COUNT }, (_, index) => <PosterCardSkeleton key={index} />);

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
    <div aria-busy={isLoading} className={GRID_CLASS_NAME}>
      {items.map((item, index) => (
        <PosterCard
          key={mediaKey(item)}
          item={item}
          priority={index < PRIORITY_COUNT}
          enterDelayMs={index < STAGGER_COUNT ? index * STAGGER_STEP_MS : undefined}
        />
      ))}
      {isLoading && renderSkeletons()}
      <div ref={sentinelRef} className='col-span-3 sm:w-full' />
    </div>
  );
}

export function PosterGridSkeleton() {
  return (
    <div aria-busy='true' className={GRID_CLASS_NAME}>
      {renderSkeletons()}
    </div>
  );
}
