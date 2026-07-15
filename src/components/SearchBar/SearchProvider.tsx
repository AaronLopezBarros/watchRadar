'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type SearchContextValue = {
  debouncedQuery: string;
  // eslint-disable-next-line no-unused-vars -- `value` names the parameter for documentation, TS function types require a name
  setDebouncedQuery: (value: string) => void;
};

const SearchContext = createContext<SearchContextValue>({
  debouncedQuery: '',
  setDebouncedQuery: () => {},
});

export const useSearch = () => useContext(SearchContext);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [debouncedQuery, setDebouncedQuery] = useState('');

  return <SearchContext.Provider value={{ debouncedQuery, setDebouncedQuery }}>{children}</SearchContext.Provider>;
}
