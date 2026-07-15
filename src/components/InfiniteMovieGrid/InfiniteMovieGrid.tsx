'use client';

import { useCallback } from 'react';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import { usePaginatedMovies } from '@/src/components/MovieGrid/hooks/usePaginatedMovies';
import { MovieGrid } from '@/src/components/MovieGrid/MovieGrid';
import type { Movie, MovieCategory } from '@/src/lib/api/tmdb/types';

type InfiniteMovieGridProps = {
  initialMovies: Movie[];
  initialPage: number;
  category: MovieCategory;
};

export function InfiniteMovieGrid({ initialMovies, initialPage, category }: InfiniteMovieGridProps) {
  const fetchPage = useCallback((page: number) => fetchMovies(category, page), [category]);
  const { movies, isLoading, loadMore } = usePaginatedMovies({ initialMovies, initialPage, fetchPage });

  return <MovieGrid movies={movies} isLoading={isLoading} onIntersect={loadMore} />;
}
