'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type SearchContextValue = {
  debouncedQuery: string;
  // eslint-disable-next-line no-unused-vars -- `value` names the parameter for documentation, TS function types require a name
  setDebouncedQuery: (value: string) => void;
  isSearchOpen: boolean;
  // eslint-disable-next-line no-unused-vars -- `value` names the parameter for documentation, TS function types require a name
  setIsSearchOpen: (value: boolean) => void;
};

const SearchContext = createContext<SearchContextValue>({
  debouncedQuery: '',
  setDebouncedQuery: () => {},
  isSearchOpen: false,
  setIsSearchOpen: () => {},
});

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <SearchContext.Provider value={{ debouncedQuery, setDebouncedQuery, isSearchOpen, setIsSearchOpen }}>
      {children}
    </SearchContext.Provider>
  );
}
