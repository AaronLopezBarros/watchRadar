import { fetchMovies } from '@/lib/api/tmdb/actions';
import type { MovieCategory } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid/InfiniteMovieGrid';

const INITIAL_PAGE = 1;

type CategoryMoviesProps = {
  category: MovieCategory;
  locale: Locale;
};

export async function CategoryMovies({ category, locale }: CategoryMoviesProps) {
  const movies = await fetchMovies(category, INITIAL_PAGE, locale);

  return <InfiniteMovieGrid initialMovies={movies} initialPage={INITIAL_PAGE} category={category} locale={locale} />;
}
