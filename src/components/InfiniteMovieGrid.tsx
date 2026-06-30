'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchPopularMovies } from '@/lib/api/tmdb/actions';
import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { MovieCardSkeleton } from '@/src/components/MovieCard/MovieCardSkeleton';
import type { Movie } from '@/src/lib/api/tmdb/types';

const INITIAL_PAGE = 1;
const SKELETON_COUNT = 20;
const LOAD_MARGIN = 300;

type InfiniteMovieGridProps = {
  initialMovies: Movie[];
};

export function InfiniteMovieGrid({ initialMovies }: InfiniteMovieGridProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(INITIAL_PAGE);
  const seenIdsRef = useRef(new Set(initialMovies.map(movie => movie.id)));

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const nextPage = pageRef.current + 1;
      const newMovies = await fetchPopularMovies(nextPage);
      const unique = newMovies.filter(movie => !seenIdsRef.current.has(movie.id));

      unique.forEach(movie => seenIdsRef.current.add(movie.id));
      setMovies(prev => [...prev, ...unique]);
      pageRef.current = nextPage;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: `${LOAD_MARGIN}px` },
    );

    observer.observe(sentinelRef.current!);

    return () => observer.disconnect();
  }, [movies, loadMore]);

  return (
    <div className='flex flex-wrap items-center justify-center gap-5 overflow-visible px-5 py-10'>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
      {isLoading && Array.from({ length: SKELETON_COUNT }, (_, index) => <MovieCardSkeleton key={index} />)}
      <div ref={sentinelRef} className='w-full' />
    </div>
  );
}
