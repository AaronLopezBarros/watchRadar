'use server';

import { getMovieWatchProviders } from '@/lib/api/tmdb/movies';
import type { WatchProvidersResponse } from '@/lib/api/tmdb/types';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  getMovieWatchProviders(movieId);
