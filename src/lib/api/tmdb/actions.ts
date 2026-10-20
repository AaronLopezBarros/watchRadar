'use server';

import { tmdbClient } from '@/lib/api/tmdb/client';
import { TMDB_LANGUAGE } from '@/lib/api/tmdb/constants';
import { getDiscoverParams, hasFilters } from '@/lib/api/tmdb/discover';
import { MEDIA_CONFIG, hasCategoryEndpoint, isMediaCategory, isMediaGenre, isMediaType } from '@/lib/api/tmdb/media';
import type {
  Genre,
  GenresResponse,
  MediaCategory,
  MediaFilters,
  MediaItem,
  MediaType,
  TmdbItem,
  TmdbItemDetails,
  TmdbListResponse,
  WatchProvidersResponse,
} from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

// Every export of a 'use server' file is callable from the client with any arguments, and these end up in a TMDB
// path sent with our token, so only known values get through.
const assertMediaType: (value: unknown) => asserts value is MediaType = value => {
  if (!isMediaType(value)) throw new Error(`Unknown media type: ${String(value)}`);
};

const assertMediaId: (value: unknown) => asserts value is number = value => {
  if (typeof value !== 'number' || !Number.isInteger(value) || value <= 0) {
    throw new Error(`Invalid media id: ${String(value)}`);
  }
};

export const fetchWatchProviders = async (mediaType: MediaType, id: number): Promise<WatchProvidersResponse> => {
  assertMediaType(mediaType);
  assertMediaId(id);
  return tmdbClient<WatchProvidersResponse>(`/${mediaType}/${id}/watch/providers`);
};

export const fetchMediaDetails = async <M extends MediaType>(
  mediaType: M,
  id: number,
  locale: Locale,
): Promise<MediaItem> => {
  assertMediaType(mediaType);
  assertMediaId(id);
  const item = await tmdbClient<TmdbItemDetails<M>>(`/${mediaType}/${id}`, {
    params: { language: TMDB_LANGUAGE[locale] },
  });
  return MEDIA_CONFIG[mediaType].normalize(item, item.genres);
};

// Genre names barely ever change, so one cached request per media type and locale serves every user for a day.
// Not exported: every export of a 'use server' file becomes a client-callable action.
// A failure only costs the genre names, so it shouldn't take the list down with it.
const fetchGenres = async (mediaType: MediaType, locale: Locale): Promise<Genre[]> => {
  const data = await tmdbClient<GenresResponse>(`/genre/${mediaType}/list`, {
    params: { language: TMDB_LANGUAGE[locale] },
    revalidate: 86400,
  }).catch(() => ({ genres: [] }));
  return data.genres;
};

const withGenreNames = <M extends MediaType>(mediaType: M, items: TmdbItem<M>[], genres: Genre[]): MediaItem[] =>
  items.map(({ genre_ids, ...item }) =>
    MEDIA_CONFIG[mediaType].normalize(
      item,
      genre_ids.flatMap(genreId => genres.find(genre => genre.id === genreId) ?? []),
    ),
  );

export const fetchMedia = async <M extends MediaType>(
  mediaType: M,
  category: MediaCategory,
  page: number,
  locale: Locale,
  filters: MediaFilters<M> = {},
): Promise<MediaItem[]> => {
  assertMediaType(mediaType);
  if (!isMediaCategory(category)) throw new Error(`Unknown category: ${String(category)}`);
  if (filters.genre && !isMediaGenre(mediaType, filters.genre)) {
    throw new Error(`Unknown ${mediaType} genre: ${String(filters.genre)}`);
  }

  const params = { page, language: TMDB_LANGUAGE[locale] };

  const [data, genres] = await Promise.all([
    hasFilters(filters) || !hasCategoryEndpoint(mediaType, category)
      ? tmdbClient<TmdbListResponse<TmdbItem<M>>>(`/discover/${mediaType}`, {
          params: { ...params, ...getDiscoverParams(mediaType, category, filters, new Date()), include_adult: false },
        })
      : tmdbClient<TmdbListResponse<TmdbItem<M>>>(`/${mediaType}/${category}`, { params }),
    fetchGenres(mediaType, locale),
  ]);
  return withGenreNames(mediaType, data.results, genres);
};

export const searchMedia = async (
  mediaType: MediaType,
  query: string,
  page: number,
  locale: Locale,
): Promise<MediaItem[]> => {
  assertMediaType(mediaType);

  const [data, genres] = await Promise.all([
    tmdbClient<TmdbListResponse<TmdbItem>>(`/search/${mediaType}`, {
      params: { query, page, include_adult: false, language: TMDB_LANGUAGE[locale] },
      revalidate: 60,
    }),
    fetchGenres(mediaType, locale),
  ]);
  return withGenreNames(mediaType, data.results, genres);
};
