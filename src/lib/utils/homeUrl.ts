import { MOVIE_CATEGORIES, MOVIE_GENRES, STREAMING_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieFilters, MovieGenre } from '@/lib/api/tmdb/types';

const DEFAULT_CATEGORY: MovieCategory = 'popular';
const STREAMING_ON = '1';

type HomeHrefOptions = MovieFilters & {
  category: MovieCategory;
};

export type HomeSearchParams = {
  category?: string;
  genre?: string;
  streaming?: string;
};

const isMovieCategory = (value: string | undefined): value is MovieCategory =>
  MOVIE_CATEGORIES.some(category => category === value);

const isMovieGenre = (value: string | undefined): value is MovieGenre => MOVIE_GENRES.some(genre => genre === value);

export const buildHomeHref = ({ category, genre, streaming }: HomeHrefOptions): string => {
  const searchParams = new URLSearchParams();

  if (category !== DEFAULT_CATEGORY) searchParams.set('category', category);
  if (genre) searchParams.set('genre', genre);
  if (streaming && STREAMING_CATEGORIES.includes(category)) searchParams.set('streaming', STREAMING_ON);

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};

export const parseHomeSearchParams = (params: HomeSearchParams): { category: MovieCategory; filters: MovieFilters } => {
  const category = isMovieCategory(params.category) ? params.category : DEFAULT_CATEGORY;

  return {
    category,
    filters: {
      genre: isMovieGenre(params.genre) ? params.genre : undefined,
      streaming: params.streaming === STREAMING_ON && STREAMING_CATEGORIES.includes(category),
    },
  };
};
