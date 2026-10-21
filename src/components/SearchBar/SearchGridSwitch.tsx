'use client';

import type { ReactNode } from 'react';

import { useLocale } from '@/components/LocaleProvider';
import { useSearch } from '@/components/SearchBar/SearchProvider';
import { SearchResultsGrid } from '@/components/SearchBar/SearchResultsGrid';
import type { MediaType } from '@/lib/api/tmdb/types';

type SearchGridSwitchProps = {
  mediaType: MediaType;
  children: ReactNode;
};

export function SearchGridSwitch({ mediaType, children }: SearchGridSwitchProps) {
  const { debouncedQuery } = useSearch();
  const locale = useLocale();

  if (!debouncedQuery) return <>{children}</>;

  return (
    <SearchResultsGrid key={`${mediaType}-${debouncedQuery}-${locale}`} mediaType={mediaType} query={debouncedQuery} />
  );
}
