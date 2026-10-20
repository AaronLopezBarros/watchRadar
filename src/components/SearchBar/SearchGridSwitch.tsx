'use client';

import type { ReactNode } from 'react';

import type { MediaType } from '@/lib/api/tmdb/types';
import { useLocale } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';
import { SearchResultsGrid } from '@/src/components/SearchBar/SearchResultsGrid';

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
