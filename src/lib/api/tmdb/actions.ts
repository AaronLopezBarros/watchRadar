'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import { TMDB_LANGUAGE } from '@/lib/api/tmdb/constants';
import { getDiscoverParams, hasFilters } from '@/lib/api/tmdb/discover';
import type {
  Genre,
  GenresResponse,
  Movie,
  MovieCategory,
  MovieFilters,
  MoviesResponse,
  TmdbMovie,
  WatchProvidersResponse,
} from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export const fetchMovieWatchProviders = async (movieId: number): Promise<WatchProvidersResponse> =>
  tmdbClient<WatchProvidersResponse>(`/movie/${movieId}/watch/providers`);

export const fetchMovieDetails = async (movieId: number, locale: Locale): Promise<Movie> =>
  tmdbClient<Movie>(`/movie/${movieId}`, { params: { language: TMDB_LANGUAGE[locale] } });

// Genre names barely ever change, so one cached request per locale serves every user for a day.
// Not exported: every export of a 'use server' file becomes a client-callable action.
// A failure only costs the genre names, so it shouldn't take the movie list down with it.
const fetchGenres = async (locale: Locale): Promise<Genre[]> => {
  const data = await tmdbClient<GenresResponse>('/genre/movie/list', {
    params: { language: TMDB_LANGUAGE[locale] },
    revalidate: 86400,
  }).catch(() => ({ genres: [] }));
  return data.genres;
};

const withGenreNames = (movies: TmdbMovie[], genres: Genre[]): Movie[] =>
  movies.map(({ genre_ids, ...movie }) => ({
    ...movie,
    genres: genre_ids.flatMap(genreId => genres.find(genre => genre.id === genreId) ?? []),
  }));

export const fetchMovies = async (
  category: MovieCategory,
  page: number,
  locale: Locale,
  filters: MovieFilters = {},
): Promise<Movie[]> => {
  const params = { page, language: TMDB_LANGUAGE[locale] };

  const [data, genres] = await Promise.all([
    hasFilters(filters)
      ? tmdbClient<MoviesResponse>('/discover/movie', {
          params: { ...params, ...getDiscoverParams(category, filters, new Date()), include_adult: false },
        })
      : tmdbClient<MoviesResponse>(`/movie/${category}`, { params }),
    fetchGenres(locale),
  ]);
  return withGenreNames(data.results, genres);
};

export const searchMovies = async (query: string, page: number, locale: Locale): Promise<Movie[]> => {
  const [data, genres] = await Promise.all([
    tmdbClient<MoviesResponse>('/search/movie', {
      params: { query, page, include_adult: false, language: TMDB_LANGUAGE[locale] },
      revalidate: 60,
    }),
    fetchGenres(locale),
  ]);
  return withGenreNames(data.results, genres);
};
