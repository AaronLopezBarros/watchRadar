import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PosterGrid } from '@/src/components/PosterGrid/PosterGrid';
import { createMediaItem } from '@/tests/factories/media.factory';

vi.mock('@/src/components/PosterCard/PosterCard', () => ({
  PosterCard: ({
    item,
    priority,
    enterDelayMs,
  }: {
    item: { id: number; title: string };
    priority: boolean;
    enterDelayMs?: number;
  }) => (
    <div data-testid='poster-card' data-priority={priority} data-enter-delay={enterDelayMs}>
      {item.title}
    </div>
  ),
}));

vi.mock('@/src/components/PosterCard/PosterCardSkeleton', () => ({
  PosterCardSkeleton: () => <div data-testid='skeleton' />,
}));

describe('PosterGrid', () => {
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
    const movies = [createMediaItem({ id: 1, title: 'Film A' }), createMediaItem({ id: 2, title: 'Film B' })];
    render(<PosterGrid items={movies} isLoading={false} onIntersect={vi.fn()} />);

    expect(screen.getAllByTestId('poster-card')).toHaveLength(2);
  });

  it('only marks the first movie as priority', () => {
    const movies = [createMediaItem({ id: 1, title: 'Film A' }), createMediaItem({ id: 2, title: 'Film B' })];
    render(<PosterGrid items={movies} isLoading={false} onIntersect={vi.fn()} />);

    const cards = screen.getAllByTestId('poster-card');
    expect(cards[0]).toHaveAttribute('data-priority', 'true');
    expect(cards[1]).toHaveAttribute('data-priority', 'false');
  });

  it('staggers the entrance of the first twelve cards only', () => {
    const movies = Array.from({ length: 14 }, (_, index) => createMediaItem({ id: index + 1 }));
    render(<PosterGrid items={movies} isLoading={false} onIntersect={vi.fn()} />);

    const delays = screen.getAllByTestId('poster-card').map(card => card.getAttribute('data-enter-delay'));
    expect(delays.slice(0, 3)).toEqual(['0', '30', '60']);
    expect(delays[11]).toBe('330');
    expect(delays.slice(12)).toEqual([null, null]);
  });

  it('renders skeletons while loading', () => {
    render(<PosterGrid items={[]} isLoading={true} onIntersect={vi.fn()} />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('does not render skeletons when not loading', () => {
    render(<PosterGrid items={[]} isLoading={false} onIntersect={vi.fn()} />);

    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  it('calls onIntersect when the sentinel intersects', () => {
    const onIntersect = vi.fn();
    render(<PosterGrid items={[]} isLoading={false} onIntersect={onIntersect} />);

    act(() => triggerIntersection(true));

    expect(onIntersect).toHaveBeenCalledOnce();
  });
});
