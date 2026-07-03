'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import type { Movie, MovieCategory, MoviesResponse, WatchProvidersResponse } from '@/lib/api/tmdb/types';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  tmdbClient<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);

export const fetchMovies = async (category: MovieCategory, page: number): Promise<Movie[]> => {
  const data = await tmdbClient<MoviesResponse>(`/movie/${category}`, { params: { page } });
  return data.results;
};
