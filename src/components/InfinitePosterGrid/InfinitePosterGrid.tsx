'use client';

import { useCallback } from 'react';

import { fetchMedia } from '@/lib/api/tmdb/actions';
import type { MediaCategory, MediaFilters, MediaItem, MediaType } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';
import { PosterGrid } from '@/src/components/PosterGrid/PosterGrid';
import { usePaginatedMedia } from '@/src/lib/hooks/usePaginatedMedia';

type InfinitePosterGridProps = {
  initialItems: MediaItem[];
  initialPage: number;
  mediaType: MediaType;
  category: MediaCategory;
  filters?: MediaFilters;
  locale: Locale;
};

export function InfinitePosterGrid({
  initialItems,
  initialPage,
  mediaType,
  category,
  filters,
  locale,
}: InfinitePosterGridProps) {
  const fetchPage = useCallback(
    (page: number) => fetchMedia(mediaType, category, page, locale, filters),
    [mediaType, category, locale, filters],
  );
  const { items, isLoading, loadNextPage } = usePaginatedMedia({ initialItems, initialPage, fetchPage });

  return <PosterGrid items={items} isLoading={isLoading} onIntersect={loadNextPage} />;
}
