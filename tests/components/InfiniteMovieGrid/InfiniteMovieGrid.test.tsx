import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid/InfiniteMovieGrid';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMovies: vi.fn(),
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

  it('renders initial movies', () => {
    const movies = [createMovie({ id: 1, title: 'Film A' }), createMovie({ id: 2, title: 'Film B' })];
    render(<InfiniteMovieGrid initialPage={1} initialMovies={movies} category='popular' />);
    expect(screen.getAllByTestId('movie-card')).toHaveLength(2);
  });

  it('wires the sentinel intersection to loading more movies for the given category', async () => {
    vi.mocked(fetchMovies).mockResolvedValue([createMovie({ id: 2, title: 'Film B' })]);

    render(
      <InfiniteMovieGrid
        initialPage={1}
        initialMovies={[createMovie({ id: 1, title: 'Film A' })]}
        category='top_rated'
      />,
    );
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('movie-card')).toHaveLength(2));
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 2);
  });
});
