import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovieGrid } from '@/src/components/MovieGrid/MovieGrid';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/src/components/MovieCard/MovieCard', () => ({
  MovieCard: ({ movie, priority }: { movie: { id: number; title: string }; priority: boolean }) => (
    <div data-testid='movie-card' data-priority={priority}>
      {movie.title}
    </div>
  ),
}));

vi.mock('@/src/components/MovieCard/MovieCardSkeleton', () => ({
  MovieCardSkeleton: () => <div data-testid='skeleton' />,
}));

describe('MovieGrid', () => {
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

  it('renders a movie card for each movie', () => {
    const movies = [createMovie({ id: 1, title: 'Film A' }), createMovie({ id: 2, title: 'Film B' })];
    render(<MovieGrid movies={movies} isLoading={false} onIntersect={vi.fn()} />);

    expect(screen.getAllByTestId('movie-card')).toHaveLength(2);
  });

  it('only marks the first movie as priority', () => {
    const movies = [createMovie({ id: 1, title: 'Film A' }), createMovie({ id: 2, title: 'Film B' })];
    render(<MovieGrid movies={movies} isLoading={false} onIntersect={vi.fn()} />);

    const cards = screen.getAllByTestId('movie-card');
    expect(cards[0]).toHaveAttribute('data-priority', 'true');
    expect(cards[1]).toHaveAttribute('data-priority', 'false');
  });

  it('renders skeletons while loading', () => {
    render(<MovieGrid movies={[]} isLoading={true} onIntersect={vi.fn()} />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('does not render skeletons when not loading', () => {
    render(<MovieGrid movies={[]} isLoading={false} onIntersect={vi.fn()} />);

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  it('calls onIntersect when the sentinel intersects', () => {
    const onIntersect = vi.fn();
    render(<MovieGrid movies={[]} isLoading={false} onIntersect={onIntersect} />);

    act(() => triggerIntersection(true));

    expect(onIntersect).toHaveBeenCalledOnce();
  });
});
