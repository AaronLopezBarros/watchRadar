import { tmdbClient } from '@/lib/api/tmdb/client';
import type { Movie, PopularMoviesResponse } from '@/lib/api/tmdb/types';
import { deduplicateById } from '@/lib/utils';

export const getPopularMovies = async (page = 1): Promise<PopularMoviesResponse> =>
  tmdbClient<PopularMoviesResponse>(`/movie/popular`, { params: { page } });

export const getPopularMoviesMultiplePages = async (pages = 1): Promise<Movie[]> => {
  const requests = Array.from({ length: pages }, (_, index) => getPopularMovies(index + 1));
  const responses = await Promise.all(requests);
  return deduplicateById(responses.flatMap(response => response.results));
};
