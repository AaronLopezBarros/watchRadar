import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEBOUNCE_DELAY_MS, MIN_QUERY_LENGTH, SearchBar } from '@/components/SearchBar/SearchBar';

const setDebouncedQuery = vi.fn();

vi.mock('@/components/SearchBar/SearchProvider', async () => {
  const { useState } = await import('react');

  return {
    useSearch: () => {
      const [isSearchOpen, setIsSearchOpen] = useState(false);
      return { debouncedQuery: '', setDebouncedQuery, isSearchOpen, setIsSearchOpen };
    },
  };
});

describe('SearchBar', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  });

  afterEach(() => {
    vi.useRealTimers();
    Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  });

  it('renders a closed search button initially', () => {
    render(<SearchBar mediaType='movie' />);

    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Search movies…')).not.toBeInTheDocument();
  });

  it('opens the input when the search button is clicked', async () => {
    render(<SearchBar mediaType='movie' />);

    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    expect(screen.getByPlaceholderText('Search movies…')).toBeInTheDocument();
  });

  it('does not commit a query shorter than the minimum length', async () => {
    render(<SearchBar mediaType='movie' />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    await user.type(screen.getByPlaceholderText('Search movies…'), 'b'.repeat(MIN_QUERY_LENGTH - 1));
    act(() => vi.advanceTimersByTime(DEBOUNCE_DELAY_MS));

    expect(setDebouncedQuery).toHaveBeenCalledWith('');
  });

  it('commits the trimmed query after the debounce delay', async () => {
    render(<SearchBar mediaType='movie' />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    await user.type(screen.getByPlaceholderText('Search movies…'), '  batman  ');
    act(() => vi.advanceTimersByTime(DEBOUNCE_DELAY_MS));

    expect(setDebouncedQuery).toHaveBeenCalledWith('batman');
  });

  it('resets the debounce timer on each keystroke', async () => {
    render(<SearchBar mediaType='movie' />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));
    const input = screen.getByPlaceholderText('Search movies…');

    // Between the two waits the first keystrokes' timer would have fired, so only a reset keeps the query uncommitted.
    const mostOfTheDelay = DEBOUNCE_DELAY_MS * 0.6;
    await user.type(input, 'bat');
    act(() => vi.advanceTimersByTime(mostOfTheDelay));
    await user.type(input, 'man');
    act(() => vi.advanceTimersByTime(mostOfTheDelay));

    expect(setDebouncedQuery).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(mostOfTheDelay));

    expect(setDebouncedQuery).toHaveBeenCalledWith('batman');
  });

  it('closes the search, clears the text and resets the query', async () => {
    render(<SearchBar mediaType='movie' />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));
    await user.type(screen.getByPlaceholderText('Search movies…'), 'batman');

    await user.click(screen.getByRole('button', { name: 'Close search' }));

    expect(setDebouncedQuery).toHaveBeenCalledWith('');
    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
  });

  it('closes the search and returns focus to the trigger on Escape', async () => {
    render(<SearchBar mediaType='movie' />);
    const trigger = screen.getByRole('button', { name: 'Search movies' });
    await user.click(trigger);

    await user.keyboard('{Escape}');

    expect(screen.queryByPlaceholderText('Search movies…')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search movies' })).toHaveFocus();
  });

  it('keeps the field until its closing animation ends, then reopens it fresh', async () => {
    // jsdom runs no animations; a running CSS animation is what makes the field wait for animationend.
    HTMLElement.prototype.getAnimations = () => [{ animationName: 'search-out' } as unknown as Animation];
    render(<SearchBar mediaType='movie' />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));
    const field = screen.getByPlaceholderText('Search movies…');

    await user.click(screen.getByRole('button', { name: 'Close search' }));
    expect(field).toBeInTheDocument();

    fireEvent.animationEnd(field.parentElement!);
    expect(field).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();

    // Reopened, the field starts fresh: its opening animation ending doesn't close it.
    await user.click(screen.getByRole('button', { name: 'Search movies' }));
    const reopened = screen.getByPlaceholderText('Search movies…');
    fireEvent.animationEnd(reopened.parentElement!);
    expect(reopened).toBeInTheDocument();
  });

  it('ignores other key presses while open', async () => {
    render(<SearchBar mediaType='movie' />);
    await user.click(screen.getByRole('button', { name: 'Search movies' }));

    await user.keyboard('a');

    expect(screen.getByPlaceholderText('Search movies…')).toBeInTheDocument();
  });
});
