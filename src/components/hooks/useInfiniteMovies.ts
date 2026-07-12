'use client';

import { useCallback, useRef, useState } from 'react';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import type { Movie, MovieCategory } from '@/src/lib/api/tmdb/types';

type UseInfiniteMoviesOptions = {
  initialMovies: Movie[];
  initialPage: number;
  category: MovieCategory;
};

export const useInfiniteMovies = ({ initialMovies, initialPage, category }: UseInfiniteMoviesOptions) => {
  const [movies, setMovies] = useState(initialMovies);
  const [isLoading, setIsLoading] = useState(false);
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

  return { movies, isLoading, loadMore };
}
