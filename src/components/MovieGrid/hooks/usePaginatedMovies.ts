'use client';

import { useCallback, useRef, useState } from 'react';

import type { Movie } from '@/src/lib/api/tmdb/types';

type UsePaginatedMoviesOptions = {
  initialMovies: Movie[];
  initialPage: number;
  // eslint-disable-next-line no-unused-vars -- `page` names the parameter for documentation, TS function types require a name
  fetchPage: (page: number) => Promise<Movie[]>;
  startLoading?: boolean;
};

export const usePaginatedMovies = ({
  initialMovies,
  initialPage,
  fetchPage,
  startLoading,
}: UsePaginatedMoviesOptions) => {
  const [movies, setMovies] = useState(initialMovies);
  const [isLoading, setIsLoading] = useState(startLoading ?? false);
  const [error, setError] = useState(false);
  const isLoadingRef = useRef(false);
  const pageRef = useRef(initialPage);
  const seenIdsRef = useRef(new Set(initialMovies.map(movie => movie.id)));

  const loadMore = useCallback(async () => {
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;
    setIsLoading(true);
    setError(false);

    try {
      const nextPage = pageRef.current + 1;
      const newMovies = await fetchPage(nextPage);
      const unique = newMovies.filter(movie => !seenIdsRef.current.has(movie.id));

      unique.forEach(movie => seenIdsRef.current.add(movie.id));
      setMovies(prev => [...prev, ...unique]);
      pageRef.current = nextPage;
    } catch {
      setError(true);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchPage]);

  return { movies, isLoading, error, loadMore };
};
