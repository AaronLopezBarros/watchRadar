import type { Metadata } from 'next';
import { Suspense } from 'react';

import { fetchMediaDetails } from '@/lib/api/tmdb/actions';
import { getLocale, getMetadataLocale } from '@/lib/i18n/getLocale';
import { getPosterUrl, parseHomeSearchParams, type HomeSearchParams } from '@/lib/utils';
import { CategoryPosters } from '@/src/components/CategoryPosters';
import { CategoryTabs } from '@/src/components/CategoryTabs';
import { PosterGridSkeleton } from '@/src/components/PosterGrid/PosterGrid';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';
import { SharedMedia } from '@/src/components/SharedMedia/SharedMedia';

type HomeProps = {
  searchParams: Promise<HomeSearchParams>;
};

// Link-preview bots get the sharer's locale; people get the page's, so Next dedupes this fetch with SharedMedia's.
export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const { sharedMedia, sharedLocale } = parseHomeSearchParams(await searchParams);
  if (!sharedMedia) return {};

  const { mediaType, id } = sharedMedia;
  const item = await fetchMediaDetails(mediaType, id, await getMetadataLocale(sharedLocale)).catch(() => null);
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
  const { mediaType, category, filters, sharedMedia } = parseHomeSearchParams(await searchParams);
  const locale = await getLocale();

  return (
    <SearchProvider>
      <CategoryTabs mediaType={mediaType} active={category} filters={filters} locale={locale} />
      <SearchGridSwitch mediaType={mediaType}>
        {/* Keyed so each tab or filter change shows the skeleton instead of the old posters. */}
        <Suspense
          key={`${mediaType}-${category}-${filters.genre}-${filters.streaming}-${locale}`}
          fallback={<PosterGridSkeleton />}
        >
          <CategoryPosters mediaType={mediaType} category={category} filters={filters} locale={locale} />
        </Suspense>
      </SearchGridSwitch>
      {sharedMedia && (
        <Suspense fallback={null}>
          <SharedMedia sharedMedia={sharedMedia} locale={locale} />
        </Suspense>
      )}
    </SearchProvider>
  );
}
