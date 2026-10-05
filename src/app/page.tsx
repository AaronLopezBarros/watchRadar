import { MOVIE_CATEGORIES, MOVIE_GENRES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';
import { getLocale } from '@/lib/i18n/getLocale';
import { CategoryMovies } from '@/src/components/CategoryMovies';
import { CategoryTabs } from '@/src/components/CategoryTabs';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';

const DEFAULT_CATEGORY: MovieCategory = 'popular';

type HomeProps = {
  searchParams: Promise<{ category?: string; genre?: string }>;
};

const isMovieCategory = (value: string | undefined): value is MovieCategory =>
  MOVIE_CATEGORIES.some(category => category === value);

const isMovieGenre = (value: string | undefined): value is MovieGenre => MOVIE_GENRES.some(genre => genre === value);

export default async function Home({ searchParams }: HomeProps) {
  const { category: rawCategory, genre: rawGenre } = await searchParams;
  const category = isMovieCategory(rawCategory) ? rawCategory : DEFAULT_CATEGORY;
  const genre = isMovieGenre(rawGenre) ? rawGenre : undefined;
  const locale = await getLocale();

  return (
    <SearchProvider>
      <CategoryTabs active={category} genre={genre} locale={locale} />
      <SearchGridSwitch>
        <CategoryMovies key={`${category}-${genre}-${locale}`} category={category} genre={genre} locale={locale} />
      </SearchGridSwitch>
    </SearchProvider>
  );
}
