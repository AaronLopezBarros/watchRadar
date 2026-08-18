'use client';

import { useRef } from 'react';

import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/src/components/MovieCard/MovieCardSkeleton';
import { useInfiniteScroll } from '@/src/components/MovieGrid/hooks/useInfiniteScroll';
import type { Movie } from '@/src/lib/api/tmdb/types';

const SKELETON_COUNT = 20;
const LOAD_MARGIN = 300;
const PRIORITY_COUNT = 1;

type MovieGridProps = {
  movies: Movie[];
  isLoading: boolean;
  onIntersect: () => void;
};

export function MovieGrid({ movies, isLoading, onIntersect }: MovieGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useInfiniteScroll(sentinelRef, {
    onIntersect,
    rootMargin: `${LOAD_MARGIN}px`,
    resetKey: movies.length,
  });

  return (
    <div className='grid grid-cols-3 gap-4 px-3 py-10 max-[380px]:gap-3 max-[380px]:px-2 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-5 sm:px-5'>
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} priority={index < PRIORITY_COUNT} />
      ))}
      {isLoading && Array.from({ length: SKELETON_COUNT }, (_, index) => <MovieCardSkeleton key={index} />)}
      <div ref={sentinelRef} className='col-span-3 sm:w-full' />
    </div>
  );
}
