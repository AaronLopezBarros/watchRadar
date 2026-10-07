import type { Metadata } from 'next';
import { Suspense } from 'react';

import { fetchMovieDetails } from '@/lib/api/tmdb/actions';
import { getLocale } from '@/lib/i18n/getLocale';
import { getPosterUrl, parseHomeSearchParams, type HomeSearchParams } from '@/lib/utils';
import { CategoryMovies } from '@/src/components/CategoryMovies';
import { CategoryTabs } from '@/src/components/CategoryTabs';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';
import { SharedMovie } from '@/src/components/SharedMovie/SharedMovie';

type HomeProps = {
  searchParams: Promise<HomeSearchParams>;
};

// Gives shared movie links a proper preview in chat apps. Next dedupes this TMDB fetch with SharedMovie's.
export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { movieId } = parseHomeSearchParams(await searchParams);
  if (!movieId) return {};

  const movie = await fetchMovieDetails(movieId, await getLocale()).catch(() => null);
  if (!movie) return {};

  const title = `${movie.title} · WatchRadar`;
  const description = movie.overview || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: movie.poster_path ? [getPosterUrl(movie.poster_path)] : undefined,
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const { category, filters, movieId } = parseHomeSearchParams(await searchParams);
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
      {movieId && (
        <Suspense fallback={null}>
          <SharedMovie movieId={movieId} locale={locale} />
        </Suspense>
      )}
    </SearchProvider>
  );
}
