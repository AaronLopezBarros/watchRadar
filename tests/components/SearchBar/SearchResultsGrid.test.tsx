import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { searchMovies } from '@/lib/api/tmdb/actions';
import { SearchResultsGrid } from '@/src/components/SearchBar/SearchResultsGrid';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  searchMovies: vi.fn(),
}));

vi.mock('@/src/components/MovieCard/MovieCard', () => ({
  MovieCard: ({ movie }: { movie: { id: number; title: string } }) => (
    <div data-testid='movie-card'>{movie.title}</div>
  ),
}));

vi.mock('@/src/components/MovieCard/MovieCardSkeleton', () => ({
  MovieCardSkeleton: () => <div data-testid='skeleton' />,
}));

describe('SearchResultsGrid', () => {
  let observerCallback: IntersectionObserverCallback | undefined;

  const triggerIntersection = (isIntersecting: boolean) =>
    observerCallback!([{ isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver);

  beforeEach(() => {
    observerCallback = undefined;

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  it('shows skeletons before the first page resolves', () => {
    render(<SearchResultsGrid query='batman' />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('fetches and renders results for the given query', async () => {
    vi.mocked(searchMovies).mockResolvedValue([createMovie({ id: 1, title: 'Batman' })]);
    render(<SearchResultsGrid query='batman' />);

    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getByTestId('movie-card')).toHaveTextContent('Batman'));
    expect(searchMovies).toHaveBeenCalledWith('batman', 1, 'en');
  });

  it('shows an empty state when the search resolves with no results', async () => {
    vi.mocked(searchMovies).mockResolvedValue([]);
    render(<SearchResultsGrid query='batman' />);

    act(() => triggerIntersection(true));

    const message = await screen.findByText(/No results found for/);
    expect(message).toHaveTextContent('batman');
  });

  it('shows an error state with a retry action, and recovers on retry', async () => {
    vi.mocked(searchMovies).mockRejectedValueOnce(new Error('boom'));
    render(<SearchResultsGrid query='batman' />);

    act(() => triggerIntersection(true));

    const retryButton = await screen.findByRole('button', { name: 'Retry' });
    expect(screen.getByText('The search could not be completed.')).toBeInTheDocument();

    vi.mocked(searchMovies).mockResolvedValueOnce([createMovie({ id: 1, title: 'Batman' })]);
    fireEvent.click(retryButton);

    await waitFor(() => expect(screen.getByTestId('movie-card')).toHaveTextContent('Batman'));
  });
});
