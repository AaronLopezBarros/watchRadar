import { fetchMedia } from '@/lib/api/tmdb/actions';
import { mediaKey } from '@/lib/api/tmdb/media';
import type { MediaFilters, MovieCategory } from '@/lib/api/tmdb/types';
import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/locale';
import { InfinitePosterGrid } from '@/src/components/InfinitePosterGrid/InfinitePosterGrid';

const INITIAL_PAGE_COUNT = 3;

type CategoryPostersProps = {
  category: MovieCategory;
  filters?: MediaFilters<'movie'>;
  locale: Locale;
};

export async function CategoryPosters({ category, filters, locale }: CategoryPostersProps) {
  const pages = await Promise.all(
    Array.from({ length: INITIAL_PAGE_COUNT }, (_, index) => fetchMedia('movie', category, index + 1, locale, filters)),
  );
  // TMDB pages aren't a stable snapshot (discover especially reshuffles by popularity between requests),
  // so the same item can land on two of the pages fetched in parallel.
  const items = [...new Map(pages.flat().map(item => [mediaKey(item), item])).values()];

  if (items.length === 0) {
    return (
      <div className='px-5 py-16 text-center text-white/60'>
        <p>{getDictionary(locale).filters.noResults}</p>
      </div>
    );
  }

  return (
    <InfinitePosterGrid
      initialItems={items}
      initialPage={INITIAL_PAGE_COUNT}
      category={category}
      filters={filters}
      locale={locale}
    />
  );
}
