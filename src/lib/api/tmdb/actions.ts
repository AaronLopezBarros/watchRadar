'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import type { WatchProvidersResponse } from '@/lib/api/tmdb/types';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  tmdbClient<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);
