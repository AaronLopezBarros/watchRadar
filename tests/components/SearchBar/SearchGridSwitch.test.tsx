import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';

const useSearchMock = vi.fn();

vi.mock('@/src/components/SearchBar/SearchProvider', () => ({
  useSearch: () => useSearchMock(),
}));

vi.mock('@/src/components/SearchBar/SearchResultsGrid', () => ({
  SearchResultsGrid: ({ query }: { query: string }) => <div data-testid='search-results'>{query}</div>,
}));

describe('SearchGridSwitch', () => {
  it('renders the children when there is no debounced query', () => {
    useSearchMock.mockReturnValue({ debouncedQuery: '' });

    render(
      <SearchGridSwitch>
        <div data-testid='children' />
      </SearchGridSwitch>,
    );

    expect(screen.getByTestId('children')).toBeInTheDocument();
    expect(screen.queryByTestId('search-results')).not.toBeInTheDocument();
  });

  it('renders SearchResultsGrid with the query when there is a debounced query', () => {
    useSearchMock.mockReturnValue({ debouncedQuery: 'batman' });

    render(
      <SearchGridSwitch>
        <div data-testid='children' />
      </SearchGridSwitch>,
    );

    expect(screen.getByTestId('search-results')).toHaveTextContent('batman');
    expect(screen.queryByTestId('children')).not.toBeInTheDocument();
  });
});
