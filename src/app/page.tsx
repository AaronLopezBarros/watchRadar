import { MOVIE_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory } from '@/lib/api/tmdb/types';
import { getLocale } from '@/lib/i18n/getLocale';
import { CategoryMovies } from '@/src/components/CategoryMovies';
import { CategoryTabs } from '@/src/components/CategoryTabs';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';

const DEFAULT_CATEGORY: MovieCategory = 'popular';

type HomeProps = {
  searchParams: Promise<{ category?: string }>;
};

const isMovieCategory = (value: string | undefined): value is MovieCategory =>
  MOVIE_CATEGORIES.some(category => category === value);

export default async function Home({ searchParams }: HomeProps) {
  const { category: rawCategory } = await searchParams;
  const category = isMovieCategory(rawCategory) ? rawCategory : DEFAULT_CATEGORY;
  const locale = await getLocale();

  return (
    <SearchProvider>
      <CategoryTabs active={category} locale={locale} />
      <SearchGridSwitch>
        <CategoryMovies key={category} category={category} locale={locale} />
      </SearchGridSwitch>
    </SearchProvider>
  );
}
