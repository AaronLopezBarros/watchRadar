'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import type { Movie, PopularMoviesResponse, WatchProvidersResponse } from '@/lib/api/tmdb/types';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  tmdbClient<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);

export const fetchPopularMovies = async (page: number): Promise<Movie[]> => {
  const data = await tmdbClient<PopularMoviesResponse>(`/movie/popular`, { params: { page } });
  return data.results;
};
