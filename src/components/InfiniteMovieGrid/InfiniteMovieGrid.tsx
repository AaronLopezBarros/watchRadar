'use client';

import { useRef } from 'react';

import { useInfiniteMovies } from '@/src/components/InfiniteMovieGrid/hooks/useInfiniteMovies';
import { useInfiniteScroll } from '@/src/components/InfiniteMovieGrid/hooks/useInfiniteScroll';
import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/src/components/MovieCard/MovieCardSkeleton';
import type { Movie, MovieCategory } from '@/src/lib/api/tmdb/types';

const SKELETON_COUNT = 20;
const LOAD_MARGIN = 300;
const PRIORITY_COUNT = 1;

type InfiniteMovieGridProps = {
  initialMovies: Movie[];
  initialPage: number;
  category: MovieCategory;
};

export function InfiniteMovieGrid({ initialMovies, initialPage, category }: InfiniteMovieGridProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { movies, isLoading, loadMore } = useInfiniteMovies({ initialMovies, initialPage, category });

  useInfiniteScroll(sentinelRef, {
    onIntersect: loadMore,
    rootMargin: `${LOAD_MARGIN}px`,
    resetKey: movies.length,
  });

  return (
    <div className='flex flex-wrap items-center justify-center gap-5 overflow-visible px-5 py-10'>
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} priority={index < PRIORITY_COUNT} />
      ))}
      {isLoading && Array.from({ length: SKELETON_COUNT }, (_, index) => <MovieCardSkeleton key={index} />)}
      <div ref={sentinelRef} className='w-full' />
    </div>
  );
}
