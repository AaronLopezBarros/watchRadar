import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchPopularMovies } from '@/lib/api/tmdb/actions';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchPopularMovies: vi.fn(),
}));

vi.mock('@/src/components/MovieCard/MovieCard', () => ({
  MovieCard: ({ movie }: { movie: { id: number; title: string } }) => (
    <div data-testid='movie-card'>{movie.title}</div>
  ),
}));

vi.mock('@/src/components/MovieCard/MovieCardSkeleton', () => ({
  MovieCardSkeleton: () => <div data-testid='skeleton' />,
}));

describe('InfiniteMovieGrid', () => {
  let observerCallback: IntersectionObserverCallback | undefined;
  let disconnect: ReturnType<typeof vi.fn>;

  const triggerIntersection = (isIntersecting: boolean) =>
    observerCallback!([{ isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver);

  beforeEach(() => {
    observerCallback = undefined;
    disconnect = vi.fn();
    const capturedDisconnect = disconnect;

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb;
        }
        observe = vi.fn();
        disconnect = capturedDisconnect;
      },
    );
  });

  it('renders initial movies', () => {
    const movies = [createMovie({ id: 1, title: 'Film A' }), createMovie({ id: 2, title: 'Film B' })];
    render(<InfiniteMovieGrid initialPage={1} initialMovies={movies} />);
    expect(screen.getAllByTestId('movie-card')).toHaveLength(2);
  });

  it('loads more movies when sentinel intersects', async () => {
    vi.mocked(fetchPopularMovies).mockResolvedValue([createMovie({ id: 2, title: 'Film B' })]);

    render(<InfiniteMovieGrid initialPage={1} initialMovies={[createMovie({ id: 1, title: 'Film A' })]} />);
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('movie-card')).toHaveLength(2));
    expect(fetchPopularMovies).toHaveBeenCalledWith(2);
  });

  it('does not load when sentinel is not intersecting', () => {
    render(<InfiniteMovieGrid initialPage={1} initialMovies={[createMovie({ id: 1 })]} />);
    act(() => triggerIntersection(false));
    expect(fetchPopularMovies).not.toHaveBeenCalled();
  });

  it('deduplicates movies already in the grid', async () => {
    vi.mocked(fetchPopularMovies).mockResolvedValue([createMovie({ id: 1 }), createMovie({ id: 2 })]);

    render(<InfiniteMovieGrid initialPage={1} initialMovies={[createMovie({ id: 1 })]} />);
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('movie-card')).toHaveLength(2));
  });

  it('shows skeletons while loading', async () => {
    vi.mocked(fetchPopularMovies).mockImplementation(() => new Promise(() => {}));

    render(<InfiniteMovieGrid initialPage={1} initialMovies={[createMovie({ id: 1 })]} />);
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0));
  });

  it('prevents concurrent loads', () => {
    vi.mocked(fetchPopularMovies).mockImplementation(() => new Promise(() => {}));

    render(<InfiniteMovieGrid initialPage={1} initialMovies={[createMovie({ id: 1 })]} />);
    act(() => triggerIntersection(true));
    act(() => triggerIntersection(true));

    expect(fetchPopularMovies).toHaveBeenCalledTimes(1);
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<InfiniteMovieGrid initialPage={1} initialMovies={[createMovie({ id: 1 })]} />);
    unmount();
    expect(disconnect).toHaveBeenCalled();
  });
});
