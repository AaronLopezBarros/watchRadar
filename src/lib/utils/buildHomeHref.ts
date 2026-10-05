import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';

type HomeHrefOptions = {
  category: MovieCategory;
  genre?: MovieGenre;
};

export const buildHomeHref = ({ category, genre }: HomeHrefOptions): string => {
  const searchParams = new URLSearchParams();

  if (category !== 'popular') searchParams.set('category', category);
  if (genre) searchParams.set('genre', genre);

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};
