import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMedia } from '@/lib/api/tmdb/actions';
import { InfinitePosterGrid } from '@/src/components/InfinitePosterGrid/InfinitePosterGrid';
import { createMediaItem } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMedia: vi.fn(),
}));

vi.mock('@/src/components/PosterCard/PosterCard', () => ({
  PosterCard: ({ item }: { item: { id: number; title: string } }) => (
    <div data-testid='poster-card'>{item.title}</div>
  ),
}));

vi.mock('@/src/components/PosterCard/PosterCardSkeleton', () => ({
  PosterCardSkeleton: () => <div data-testid='skeleton' />,
}));

describe('InfinitePosterGrid', () => {
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
    const movies = [createMediaItem({ id: 1, title: 'Film A' }), createMediaItem({ id: 2, title: 'Film B' })];
    render(<InfinitePosterGrid initialPage={1} initialItems={movies} category='popular' locale='en' />);
    expect(screen.getAllByTestId('poster-card')).toHaveLength(2);
  });

  it('does not load more movies when the sentinel is not intersecting', () => {
    render(
      <InfinitePosterGrid initialPage={1} initialItems={[createMediaItem({ id: 1, title: 'Film A' })]} category='popular' locale='en' />,
    );

    act(() => triggerIntersection(false));

    expect(fetchMedia).not.toHaveBeenCalled();
  });

  it('wires the sentinel intersection to loading more movies for the given category', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ id: 2, title: 'Film B' })]);

    render(
      <InfinitePosterGrid
        initialPage={1}
        initialItems={[createMediaItem({ id: 1, title: 'Film A' })]}
        category='top_rated'
        locale='en'
      />,
    );
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('poster-card')).toHaveLength(2));
    expect(fetchMedia).toHaveBeenCalledWith('movie', 'top_rated', 2, 'en', undefined);
  });

  it('keeps the filters when loading more movies', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ id: 2, title: 'Film B' })]);

    render(
      <InfinitePosterGrid
        initialPage={1}
        initialItems={[createMediaItem({ id: 1, title: 'Film A' })]}
        category='upcoming'
        filters={{ genre: 'horror' }}
        locale='es'
      />,
    );
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('poster-card')).toHaveLength(2));
    expect(fetchMedia).toHaveBeenCalledWith('movie', 'upcoming', 2, 'es', { genre: 'horror' });
  });

  it('ignores a second loadMore call while the first one is still in flight', async () => {
    // eslint-disable-next-line no-unused-vars -- `movies` names the parameter for documentation, TS function types require a name
    let resolveFetch: ((movies: ReturnType<typeof createMediaItem>[]) => void) | undefined;
    vi.mocked(fetchMedia).mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        }),
    );

    render(
      <InfinitePosterGrid initialPage={1} initialItems={[createMediaItem({ id: 1, title: 'Film A' })]} category='popular' locale='en' />,
    );

    act(() => {
      triggerIntersection(true);
      triggerIntersection(true);
    });

    expect(fetchMedia).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch?.([createMediaItem({ id: 2, title: 'Film B' })]);
    });
  });
});
