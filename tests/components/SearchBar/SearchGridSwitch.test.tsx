import { render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '@/src/components/LocaleProvider';
import { SearchGridSwitch } from '@/src/components/SearchBar/SearchGridSwitch';

const useSearchMock = vi.fn();
const mountCount = vi.fn();

vi.mock('@/src/components/SearchBar/SearchProvider', () => ({
  useSearch: () => useSearchMock(),
}));

vi.mock('@/src/components/SearchBar/SearchResultsGrid', () => ({
  SearchResultsGrid: ({ query }: { query: string }) => {
    useEffect(() => mountCount(), []);
    return <div data-testid='search-results'>{query}</div>;
  },
}));

describe('SearchGridSwitch', () => {
  afterEach(() => {
    mountCount.mockClear();
  });

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

  it('remounts SearchResultsGrid when the locale changes for the same query', () => {
    useSearchMock.mockReturnValue({ debouncedQuery: 'batman' });

    const { rerender } = render(
      <LocaleProvider locale='en'>
        <SearchGridSwitch>
          <div data-testid='children' />
        </SearchGridSwitch>
      </LocaleProvider>,
    );

    expect(mountCount).toHaveBeenCalledTimes(1);

    rerender(
      <LocaleProvider locale='es'>
        <SearchGridSwitch>
          <div data-testid='children' />
        </SearchGridSwitch>
      </LocaleProvider>,
    );

    expect(mountCount).toHaveBeenCalledTimes(2);
  });
});
