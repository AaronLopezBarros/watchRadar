import { canFilterStreaming, isMediaCategory, isMediaGenre, isMediaType } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaFilters, MediaType } from '@/lib/api/tmdb/types';
import { isLocale, type Locale } from '@/lib/i18n/locale';

// Without `type` the home shows movies, so links shared before series existed keep working.
const DEFAULT_MEDIA_TYPE: MediaType = 'movie';
const DEFAULT_CATEGORY: MediaCategory = 'popular';
const STREAMING_ON = '1';

type HomeHrefOptions = MediaFilters & {
  mediaType?: MediaType;
  category: MediaCategory;
};

export type HomeSearchParams = {
  type?: string;
  category?: string;
  genre?: string;
  streaming?: string;
  movie?: string;
  lang?: string;
};

// The id ends up in a TMDB path (`/movie/{id}`) sent with our token, so anything but a plain id must not get through.
const parseMovieId = (value: string | undefined): number | undefined =>
  value && /^[1-9]\d*$/.test(value) ? Number(value) : undefined;

export const buildHomeHref = ({
  mediaType = DEFAULT_MEDIA_TYPE,
  category,
  genre,
  streaming,
}: HomeHrefOptions): string => {
  const searchParams = new URLSearchParams();

  if (mediaType !== DEFAULT_MEDIA_TYPE) searchParams.set('type', mediaType);
  if (category !== DEFAULT_CATEGORY) searchParams.set('category', category);
  if (genre) searchParams.set('genre', genre);
  if (streaming && canFilterStreaming(mediaType, category)) searchParams.set('streaming', STREAMING_ON);

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};

export const withMovieParam = (search: string, movieId?: number): string => {
  const searchParams = new URLSearchParams(search);

  if (movieId) {
    searchParams.set('movie', String(movieId));
  } else {
    searchParams.delete('movie');
    // The sharer's language only matters for the shared movie's link preview, so it goes along with the movie.
    searchParams.delete('lang');
  }

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};

// The sender's category and filters stay out: the recipient only cares about the movie. Their language goes in
// for the link preview (see getMetadataLocale).
export const buildShareHref = (movieId: number, locale: Locale): string =>
  `/?${new URLSearchParams({ movie: String(movieId), lang: locale }).toString()}`;

export const parseHomeSearchParams = (
  params: HomeSearchParams,
): {
  mediaType: MediaType;
  category: MediaCategory;
  filters: MediaFilters;
  movieId?: number;
  sharedLocale?: Locale;
} => {
  const mediaType = isMediaType(params.type) ? params.type : DEFAULT_MEDIA_TYPE;
  const category = isMediaCategory(params.category) ? params.category : DEFAULT_CATEGORY;

  return {
    mediaType,
    category,
    filters: {
      // Genres only exist within their media type: a movie genre on series is dropped.
      genre: isMediaGenre(mediaType, params.genre) ? params.genre : undefined,
      streaming: params.streaming === STREAMING_ON && canFilterStreaming(mediaType, category),
    },
    movieId: parseMovieId(params.movie),
    sharedLocale: isLocale(params.lang) ? params.lang : undefined,
  };
};
