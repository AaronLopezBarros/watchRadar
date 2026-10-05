import { fetchMovies } from '@/lib/api/tmdb/actions';
import type { MovieCategory, MovieFilters } from '@/lib/api/tmdb/types';
import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/locale';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid/InfiniteMovieGrid';

const INITIAL_PAGE_COUNT = 3;

type CategoryMoviesProps = {
  category: MovieCategory;
  filters?: MovieFilters;
  locale: Locale;
};

export async function CategoryMovies({ category, filters, locale }: CategoryMoviesProps) {
  const pages = await Promise.all(
    Array.from({ length: INITIAL_PAGE_COUNT }, (_, index) => fetchMovies(category, index + 1, locale, filters)),
  );
  // TMDB pages aren't a stable snapshot (discover especially reshuffles by popularity between requests),
  // so the same movie can land on two of the pages fetched in parallel.
  const movies = [...new Map(pages.flat().map(movie => [movie.id, movie])).values()];

  if (movies.length === 0) {
    return (
      <div className='px-5 py-16 text-center text-white/60'>
        <p>{getDictionary(locale).filters.noResults}</p>
      </div>
    );
  }

  return (
    <InfiniteMovieGrid
      initialMovies={movies}
      initialPage={INITIAL_PAGE_COUNT}
      category={category}
      filters={filters}
      locale={locale}
    />
  );
}
