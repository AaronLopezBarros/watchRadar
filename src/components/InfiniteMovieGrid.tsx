'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchMovies } from '@/lib/api/tmdb/actions';
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
  const [movies, setMovies] = useState(initialMovies);
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(initialPage);
  const seenIdsRef = useRef(new Set(initialMovies.map(movie => movie.id)));

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const nextPage = pageRef.current + 1;
      const newMovies = await fetchMovies(category, nextPage);
      const unique = newMovies.filter(movie => !seenIdsRef.current.has(movie.id));

      unique.forEach(movie => seenIdsRef.current.add(movie.id));
      setMovies(prev => [...prev, ...unique]);
      pageRef.current = nextPage;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [category]);

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
    <div className='flex flex-wrap items-center justify-start gap-5 overflow-visible px-5 py-10'>
      {movies.map((movie, index) => (
        <MovieCard key={movie.id} movie={movie} priority={index < PRIORITY_COUNT} />
      ))}
      {isLoading && Array.from({ length: SKELETON_COUNT }, (_, index) => <MovieCardSkeleton key={index} />)}
      <div ref={sentinelRef} className='w-full' />
    </div>
  );
}
