import { MOVIE_CATEGORIES, MOVIE_GENRES, STREAMING_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieFilters, MovieGenre } from '@/lib/api/tmdb/types';
import { isLocale, type Locale } from '@/lib/i18n/locale';

const DEFAULT_CATEGORY: MovieCategory = 'popular';
const STREAMING_ON = '1';

type HomeHrefOptions = MovieFilters & {
  category: MovieCategory;
};

export type HomeSearchParams = {
  category?: string;
  genre?: string;
  streaming?: string;
  movie?: string;
  lang?: string;
};

const isMovieCategory = (value: string | undefined): value is MovieCategory =>
  MOVIE_CATEGORIES.some(category => category === value);

const isMovieGenre = (value: string | undefined): value is MovieGenre => MOVIE_GENRES.some(genre => genre === value);

// The id ends up in a TMDB path (`/movie/{id}`) sent with our token, so anything but a plain id must not get through.
const parseMovieId = (value: string | undefined): number | undefined =>
  value && /^[1-9]\d*$/.test(value) ? Number(value) : undefined;

export const buildHomeHref = ({ category, genre, streaming }: HomeHrefOptions): string => {
  const searchParams = new URLSearchParams();

  if (category !== DEFAULT_CATEGORY) searchParams.set('category', category);
  if (genre) searchParams.set('genre', genre);
  if (streaming && STREAMING_CATEGORIES.includes(category)) searchParams.set('streaming', STREAMING_ON);

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
): { category: MovieCategory; filters: MovieFilters; movieId?: number; sharedLocale?: Locale } => {
  const category = isMovieCategory(params.category) ? params.category : DEFAULT_CATEGORY;

  return {
    category,
    filters: {
      genre: isMovieGenre(params.genre) ? params.genre : undefined,
      streaming: params.streaming === STREAMING_ON && STREAMING_CATEGORIES.includes(category),
    },
    movieId: parseMovieId(params.movie),
    sharedLocale: isLocale(params.lang) ? params.lang : undefined,
  };
};
