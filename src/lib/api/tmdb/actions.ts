'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import { TMDB_LANGUAGE } from '@/lib/api/tmdb/constants';
import type { Movie, MovieCategory, MoviesResponse, WatchProvidersResponse } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  tmdbClient<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);

export const fetchMovies = async (category: MovieCategory, page: number, locale: Locale): Promise<Movie[]> => {
  const data = await tmdbClient<MoviesResponse>(`/movie/${category}`, {
    params: { page, language: TMDB_LANGUAGE[locale] },
  });
  return data.results;
};

export const searchMovies = async (query: string, page: number, locale: Locale): Promise<Movie[]> => {
  const data = await tmdbClient<MoviesResponse>('/search/movie', {
    params: { query, page, include_adult: false, language: TMDB_LANGUAGE[locale] },
    revalidate: 60,
  });
  return data.results;
};
