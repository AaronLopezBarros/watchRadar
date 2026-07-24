'use client';

import type { ReactNode } from 'react';

import { useLocale } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';
import { SearchResultsGrid } from '@/src/components/SearchBar/SearchResultsGrid';

type SearchGridSwitchProps = {
  children: ReactNode;
};

export function SearchGridSwitch({ children }: SearchGridSwitchProps) {
  const { debouncedQuery } = useSearch();
  const locale = useLocale();

  if (!debouncedQuery) return <>{children}</>;

  return <SearchResultsGrid key={`${debouncedQuery}-${locale}`} query={debouncedQuery} />;
}
