import { fetchMovies } from '@/lib/api/tmdb/actions';
import type { MovieCategory } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid/InfiniteMovieGrid';

const INITIAL_PAGE_COUNT = 3;

type CategoryMoviesProps = {
  category: MovieCategory;
  locale: Locale;
};

export async function CategoryMovies({ category, locale }: CategoryMoviesProps) {
  const pages = await Promise.all(
    Array.from({ length: INITIAL_PAGE_COUNT }, (_, index) => fetchMovies(category, index + 1, locale)),
  );
  const movies = pages.flat();

  return (
    <InfiniteMovieGrid initialMovies={movies} initialPage={INITIAL_PAGE_COUNT} category={category} locale={locale} />
  );
}
