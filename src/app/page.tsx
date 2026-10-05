import { getLocale } from '@/lib/i18n/getLocale';
import { parseHomeSearchParams, type HomeSearchParams } from '@/lib/utils';
import { CategoryMovies } from '@/src/components/CategoryMovies';
import { CategoryTabs } from '@/src/components/CategoryTabs';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';

type HomeProps = {
  searchParams: Promise<HomeSearchParams>;
};

export default async function Home({ searchParams }: HomeProps) {
  const { category, filters } = parseHomeSearchParams(await searchParams);
  const locale = await getLocale();

  return (
    <SearchProvider>
      <CategoryTabs active={category} filters={filters} locale={locale} />
      <SearchGridSwitch>
        <CategoryMovies
          key={`${category}-${filters.genre}-${filters.streaming}-${locale}`}
          category={category}
          filters={filters}
          locale={locale}
        />
      </SearchGridSwitch>
    </SearchProvider>
  );
}
