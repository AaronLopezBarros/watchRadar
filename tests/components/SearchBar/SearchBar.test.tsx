import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SearchBar } from '@/src/components/SearchBar/SearchBar';

const setDebouncedQuery = vi.fn();

vi.mock('@/src/components/SearchBar/SearchProvider', () => ({
  useSearch: () => ({ debouncedQuery: '', setDebouncedQuery }),
}));

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders a closed search button initially', () => {
    render(<SearchBar />);

    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search movies…')).not.toBeInTheDocument();
  });

  it('opens the input when the search button is clicked', () => {
    render(<SearchBar />);

    fireEvent.click(screen.getByRole('button', { name: 'Search movies' }));

    expect(screen.getByPlaceholderText('Search movies…')).toBeInTheDocument();
  });

  it('does not commit a query shorter than the minimum length', () => {
    render(<SearchBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Search movies' }));

    fireEvent.change(screen.getByPlaceholderText('Search movies…'), { target: { value: 'b' } });
    act(() => vi.advanceTimersByTime(350));

    expect(setDebouncedQuery).toHaveBeenCalledWith('');
  });

  it('commits the trimmed query after the debounce delay', () => {
    render(<SearchBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Search movies' }));

    fireEvent.change(screen.getByPlaceholderText('Search movies…'), { target: { value: '  batman  ' } });
    act(() => vi.advanceTimersByTime(350));

    expect(setDebouncedQuery).toHaveBeenCalledWith('batman');
  });

  it('resets the debounce timer on each keystroke', () => {
    render(<SearchBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Search movies' }));
    const input = screen.getByPlaceholderText('Search movies…');

    fireEvent.change(input, { target: { value: 'bat' } });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.change(input, { target: { value: 'batman' } });
    act(() => vi.advanceTimersByTime(200));

    expect(setDebouncedQuery).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(150));

    expect(setDebouncedQuery).toHaveBeenCalledWith('batman');
  });

  it('closes the search, clears the text and resets the query', () => {
    render(<SearchBar />);
    fireEvent.click(screen.getByRole('button', { name: 'Search movies' }));
    fireEvent.change(screen.getByPlaceholderText('Search movies…'), { target: { value: 'batman' } });

    fireEvent.click(screen.getByRole('button', { name: 'Close search' }));

    expect(setDebouncedQuery).toHaveBeenCalledWith('');
    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
  });
});
