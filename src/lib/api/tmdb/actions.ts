'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import { TMDB_LANGUAGE } from '@/lib/api/tmdb/constants';
import { getDiscoverParams, hasFilters } from '@/lib/api/tmdb/discover';
import type {
  Movie,
  MovieCategory,
  MovieDetails,
  MovieFilters,
  MoviesResponse,
  WatchProvidersResponse,
} from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  tmdbClient<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);

export const fetchMovieDetails = async (movieId: number, locale: Locale): Promise<MovieDetails> =>
  tmdbClient<MovieDetails>(`/movie/${movieId}`, { params: { language: TMDB_LANGUAGE[locale] } });

export const fetchMovies = async (
  category: MovieCategory,
  page: number,
  locale: Locale,
  filters: MovieFilters = {},
): Promise<Movie[]> => {
  const params = { page, language: TMDB_LANGUAGE[locale] };

  const data = hasFilters(filters)
    ? await tmdbClient<MoviesResponse>('/discover/movie', {
        params: { ...params, ...getDiscoverParams(category, filters, new Date()), include_adult: false },
      })
    : await tmdbClient<MoviesResponse>(`/movie/${category}`, { params });
  return data.results;
};

export const searchMovies = async (query: string, page: number, locale: Locale): Promise<Movie[]> => {
  const data = await tmdbClient<MoviesResponse>('/search/movie', {
    params: { query, page, include_adult: false, language: TMDB_LANGUAGE[locale] },
    revalidate: 60,
  });
  return data.results;
};
