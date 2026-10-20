import type { Metadata } from 'next';
import { Suspense } from 'react';

import { fetchMediaDetails } from '@/lib/api/tmdb/actions';
import { getLocale, getMetadataLocale } from '@/lib/i18n/getLocale';
import { getPosterUrl, parseHomeSearchParams, type HomeSearchParams } from '@/lib/utils';
import { CategoryPosters } from '@/src/components/CategoryPosters';
import { CategoryTabs } from '@/src/components/CategoryTabs';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';
import { SharedMedia } from '@/src/components/SharedMedia/SharedMedia';

type HomeProps = {
  searchParams: Promise<HomeSearchParams>;
};

// Gives shared movie links a proper preview in chat apps, in the sharer's language. For people the locale matches
// the page's, so Next dedupes this TMDB fetch with SharedMedia's.
export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { movieId, sharedLocale } = parseHomeSearchParams(await searchParams);
  if (!movieId) return {};

  const item = await fetchMediaDetails('movie', movieId, await getMetadataLocale(sharedLocale)).catch(() => null);
  if (!item) return {};

  const title = `${item.title} · WatchRadar`;
  const description = item.overview || undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: item.poster_path ? [getPosterUrl(item.poster_path)] : undefined,
    },
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const { mediaType, category, filters, movieId } = parseHomeSearchParams(await searchParams);
  const locale = await getLocale();

  return (
    <SearchProvider>
      <CategoryTabs mediaType={mediaType} active={category} filters={filters} locale={locale} />
      <SearchGridSwitch mediaType={mediaType}>
        <CategoryPosters
          key={`${mediaType}-${category}-${filters.genre}-${filters.streaming}-${locale}`}
          mediaType={mediaType}
          category={category}
          filters={filters}
          locale={locale}
        />
      </SearchGridSwitch>
      {movieId && (
        <Suspense fallback={null}>
          <SharedMedia movieId={movieId} locale={locale} />
        </Suspense>
      )}
    </SearchProvider>
  );
}
