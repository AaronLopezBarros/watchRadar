import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SearchProvider, useSearch } from '@/src/components/SearchBar/SearchProvider';

function Consumer() {
  const { debouncedQuery, setDebouncedQuery } = useSearch();

  return (
    <div>
      <span data-testid='query'>{debouncedQuery}</span>
      <button type='button' onClick={() => setDebouncedQuery('batman')}>
        set
      </button>
    </div>
  );
}

describe('SearchProvider', () => {
  it('provides an empty debouncedQuery by default and updates it via setDebouncedQuery', async () => {
    render(
      <SearchProvider>
        <Consumer />
      </SearchProvider>,
    );

    expect(screen.getByTestId('query')).toHaveTextContent('');

    await userEvent.click(screen.getByRole('button', { name: 'set' }));

    expect(screen.getByTestId('query')).toHaveTextContent('batman');
  });

  it('exposes a no-op setDebouncedQuery as the default context value outside a provider', async () => {
    render(<Consumer />);

    expect(screen.getByTestId('query')).toHaveTextContent('');

    await userEvent.click(screen.getByRole('button', { name: 'set' }));

    expect(screen.getByTestId('query')).toHaveTextContent('');
  });
});
