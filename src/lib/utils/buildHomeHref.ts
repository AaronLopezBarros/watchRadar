import { STREAMING_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieFilters } from '@/lib/api/tmdb/types';

type HomeHrefOptions = MovieFilters & {
  category: MovieCategory;
};

export const buildHomeHref = ({ category, genre, streaming }: HomeHrefOptions): string => {
  const searchParams = new URLSearchParams();

  if (category !== 'popular') searchParams.set('category', category);
  if (genre) searchParams.set('genre', genre);
  if (streaming && STREAMING_CATEGORIES.includes(category)) searchParams.set('streaming', '1');

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};
