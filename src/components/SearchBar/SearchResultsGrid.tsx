'use client';

import { useCallback } from 'react';

import { searchMovies } from '@/lib/api/tmdb/actions';
import { usePaginatedMovies } from '@/src/components/MovieGrid/hooks/usePaginatedMovies';
import { MovieGrid } from '@/src/components/MovieGrid/MovieGrid';

type SearchResultsGridProps = {
  query: string;
};

export function SearchResultsGrid({ query }: SearchResultsGridProps) {
  const fetchPage = useCallback((page: number) => searchMovies(query, page), [query]);
  const { movies, isLoading, error, loadMore } = usePaginatedMovies({
    initialMovies: [],
    initialPage: 0,
    fetchPage,
    startLoading: true,
  });

  if (error && movies.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 px-5 py-16 text-center text-white/60'>
        <p>The search could not be completed.</p>
        <button
          type='button'
          onClick={loadMore}
          className='rounded-full bg-white/10 px-4 py-1.5 text-sm text-white transition-colors hover:bg-white/20'
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isLoading && !error && movies.length === 0) {
    return (
      <div className='px-5 py-16 text-center text-white/60'>
        <p>
          No results found for <span className='text-white'>&ldquo;{query}&rdquo;</span>.
        </p>
      </div>
    );
  }

  return <MovieGrid movies={movies} isLoading={isLoading} onIntersect={loadMore} />;
}
