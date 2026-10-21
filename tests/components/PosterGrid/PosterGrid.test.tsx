import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PosterGrid, PosterGridSkeleton, STAGGER_COUNT, STAGGER_STEP_MS } from '@/src/components/PosterGrid/PosterGrid';
import { createMediaItem } from '@/tests/factories/media.factory';

vi.mock('@/src/components/PosterCard/PosterCard', () => import('@/tests/mocks/posterCard'));

vi.mock('@/src/components/PosterCard/PosterCardSkeleton', () => import('@/tests/mocks/posterCardSkeleton'));

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

  it('staggers the entrance of the first cards only', () => {
    const movies = Array.from({ length: STAGGER_COUNT + 2 }, (_, index) => createMediaItem({ id: index + 1 }));
    render(<PosterGrid items={movies} isLoading={false} onIntersect={vi.fn()} />);

    const delays = screen.getAllByTestId('poster-card').map(card => card.getAttribute('data-enter-delay'));
    expect(delays.slice(0, 2)).toEqual(['0', String(STAGGER_STEP_MS)]);
    expect(delays[STAGGER_COUNT - 1]).toBe(String((STAGGER_COUNT - 1) * STAGGER_STEP_MS));
    expect(delays.slice(STAGGER_COUNT)).toEqual([null, null]);
  });

  it('renders skeletons while loading', () => {
    render(<PosterGrid items={[]} isLoading={true} onIntersect={vi.fn()} />);

    expect(screen.getByRole('generic', { busy: true })).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('does not render skeletons when not loading', () => {
    render(<PosterGrid items={[]} isLoading={false} onIntersect={vi.fn()} />);

    expect(screen.queryByRole('generic', { busy: true })).not.toBeInTheDocument();
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
  });

  it('calls onIntersect when the sentinel intersects', () => {
    const onIntersect = vi.fn();
    render(<PosterGrid items={[]} isLoading={false} onIntersect={onIntersect} />);

    act(() => triggerIntersection(true));

    expect(onIntersect).toHaveBeenCalledOnce();
  });
});

describe('PosterGridSkeleton', () => {
  it('renders skeletons in place of posters', () => {
    render(<PosterGridSkeleton />);

    expect(screen.getByRole('generic', { busy: true })).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('poster-card')).not.toBeInTheDocument();
  });
});
