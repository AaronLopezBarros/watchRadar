'use client';

import { useCallback } from 'react';

import { searchMedia } from '@/lib/api/tmdb/actions';
import type { MediaType } from '@/lib/api/tmdb/types';
import { useLocale, useTranslations } from '@/src/components/LocaleProvider';
import { PosterGrid } from '@/src/components/PosterGrid/PosterGrid';
import { usePaginatedMedia } from '@/src/lib/hooks/usePaginatedMedia';

type SearchResultsGridProps = {
  mediaType: MediaType;
  query: string;
};

export function SearchResultsGrid({ mediaType, query }: SearchResultsGridProps) {
  const dict = useTranslations();
  const locale = useLocale();
  const fetchPage = useCallback(
    (page: number) => searchMedia(mediaType, query, page, locale),
    [mediaType, query, locale],
  );
  const { items, isLoading, error, loadNextPage } = usePaginatedMedia({
    initialItems: [],
    initialPage: 0,
    fetchPage,
    startLoading: true,
  });

  if (error && items.length === 0) {
    return (
      <div className='flex flex-col items-center gap-3 px-5 py-16 text-center text-white/60'>
        <p>{dict.search.error}</p>
        <button
          type='button'
          onClick={loadNextPage}
          className='flex min-h-11 items-center justify-center rounded-full bg-white/10 px-4 text-sm text-white transition-colors hover:bg-white/20'
        >
          {dict.search.retry}
        </button>
      </div>
    );
  }

  if (!isLoading && !error && items.length === 0) {
    return (
      <div className='px-5 py-16 text-center text-white/60'>
        <p>
          {dict.search.noResultsFor} <span className='text-white'>&ldquo;{query}&rdquo;</span>.
        </p>
      </div>
    );
  }

  return <PosterGrid items={items} isLoading={isLoading} onIntersect={loadNextPage} />;
}
