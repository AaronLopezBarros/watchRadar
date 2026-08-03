'use client';

import { useCallback } from 'react';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import type { Movie, MovieCategory } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';
import { MovieGrid } from '@/src/components/MovieGrid/MovieGrid';
import { usePaginatedMovies } from '@/src/lib/hooks/usePaginatedMovies';

type InfiniteMovieGridProps = {
  initialMovies: Movie[];
  initialPage: number;
  category: MovieCategory;
  locale: Locale;
};

export function InfiniteMovieGrid({ initialMovies, initialPage, category, locale }: InfiniteMovieGridProps) {
  const fetchPage = useCallback((page: number) => fetchMovies(category, page, locale), [category, locale]);
  const { movies, isLoading, loadNextPage } = usePaginatedMovies({ initialMovies, initialPage, fetchPage });

  return <MovieGrid movies={movies} isLoading={isLoading} onIntersect={loadNextPage} />;
}
