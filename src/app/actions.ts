'use server';

import { getMovieWatchProviders } from '@/lib/api/tmdb/movies';
import type { WatchProvidersResponse } from '@/lib/api/tmdb/types';

export async function fetchMovieWatchProviders(movieId: number): Promise<WatchProvidersResponse> {
  return getMovieWatchProviders(movieId);
}
