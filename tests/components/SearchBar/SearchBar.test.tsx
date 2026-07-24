import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchBar } from '@/src/components/SearchBar/SearchBar';

const setDebouncedQuery = vi.fn();

vi.mock('@/src/components/SearchBar/SearchProvider', () => ({
  useSearch: () => ({ debouncedQuery: '', setDebouncedQuery }),
}));

describe('SearchBar', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a closed search button initially', () => {
    render(<SearchBar />);

    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search movies…')).not.toBeInTheDocument();
  });

  it('opens the input when the search button is clicked', async () => {
    render(<SearchBar />);

    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    expect(screen.getByPlaceholderText('Search movies…')).toBeInTheDocument();
  });

  it('does not commit a query shorter than the minimum length', async () => {
    render(<SearchBar />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    await user.type(screen.getByPlaceholderText('Search movies…'), 'b');
    act(() => vi.advanceTimersByTime(350));

    expect(setDebouncedQuery).toHaveBeenCalledWith('');
  });

  it('commits the trimmed query after the debounce delay', async () => {
    render(<SearchBar />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    await user.type(screen.getByPlaceholderText('Search movies…'), '  batman  ');
    act(() => vi.advanceTimersByTime(350));

    expect(setDebouncedQuery).toHaveBeenCalledWith('batman');
  });

  it('resets the debounce timer on each keystroke', async () => {
    render(<SearchBar />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));
    const input = screen.getByPlaceholderText('Search movies…');

    await user.type(input, 'bat');
    act(() => vi.advanceTimersByTime(200));
    await user.type(input, 'man');
    act(() => vi.advanceTimersByTime(200));

    expect(setDebouncedQuery).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(150));

    expect(setDebouncedQuery).toHaveBeenCalledWith('batman');
  });

  it('closes the search, clears the text and resets the query', async () => {
    render(<SearchBar />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));
    await user.type(screen.getByPlaceholderText('Search movies…'), 'batman');

    await user.click(screen.getByRole('button', { name: 'Close search' }));

    expect(setDebouncedQuery).toHaveBeenCalledWith('');
    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
  });

  it('closes the search and returns focus to the trigger on Escape', async () => {
    render(<SearchBar />);
    const trigger = screen.getByRole('button', { name: 'Search movies' });
    await user.click(trigger);

    await user.keyboard('{Escape}');

    expect(screen.queryByPlaceholderText('Search movies…')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search movies' })).toHaveFocus();
  });

  it('ignores other key presses while open', async () => {
    render(<SearchBar />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    await user.keyboard('a');

    expect(screen.getByPlaceholderText('Search movies…')).toBeInTheDocument();
  });
});
