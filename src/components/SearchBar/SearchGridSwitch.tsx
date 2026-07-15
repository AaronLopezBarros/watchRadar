'use client';

import type { ReactNode } from 'react';

import { useSearch } from '@/src/components/SearchBar/SearchProvider';
import { SearchResultsGrid } from '@/src/components/SearchBar/SearchResultsGrid';

type SearchGridSwitchProps = {
  children: ReactNode;
};

export function SearchGridSwitch({ children }: SearchGridSwitchProps) {
  const { debouncedQuery } = useSearch();

  if (!debouncedQuery) return <>{children}</>;

  return <SearchResultsGrid key={debouncedQuery} query={debouncedQuery} />;
}
