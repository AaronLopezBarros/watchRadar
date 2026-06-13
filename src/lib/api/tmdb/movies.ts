import { tmdbClient } from '@/lib/api/tmdb/client';
import { Movie, PopularMoviesResponse } from '@/src/lib/api/tmdb/types';
import { deduplicateById } from '@/src/lib/utils';

export const getPopularMovies = async (page = 1): Promise<PopularMoviesResponse> => {
  return tmdbClient<PopularMoviesResponse>(`/movie/popular`, {
    params: {
      page: page,
    },
  });
};

export const getPopularMoviesMultiplePages = async (pages = 1): Promise<Movie[]> => {
  const requests = Array.from({ length: pages }, (_, index) => getPopularMovies(index + 1));

  const responses = await Promise.all(requests);

  const allMovies = responses.flatMap(response => response.results);

  return deduplicateById(allMovies);
};
