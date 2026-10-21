import { act, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMedia } from '@/lib/api/tmdb/actions';
import { InfinitePosterGrid } from '@/src/components/InfinitePosterGrid/InfinitePosterGrid';
import { createMediaItem } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMedia: vi.fn(),
}));

vi.mock('@/src/components/PosterCard/PosterCard', () => import('@/tests/mocks/posterCard'));

vi.mock('@/src/components/PosterCard/PosterCardSkeleton', () => import('@/tests/mocks/posterCardSkeleton'));

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
    render(
      <InfinitePosterGrid mediaType='movie' initialPage={1} initialItems={movies} category='popular' locale='en' />,
    );
    expect(screen.getAllByTestId('poster-card')).toHaveLength(2);
  });

  it('does not load more movies when the sentinel is not intersecting', () => {
    render(
      <InfinitePosterGrid
        mediaType='movie'
        initialPage={1}
        initialItems={[createMediaItem({ id: 1, title: 'Film A' })]}
        category='popular'
        locale='en'
      />,
    );

    act(() => triggerIntersection(false));

    expect(fetchMedia).not.toHaveBeenCalled();
  });

  it('wires the sentinel intersection to loading more movies for the given category', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ id: 2, title: 'Film B' })]);

    render(
      <InfinitePosterGrid
        mediaType='movie'
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

  it('loads more series for a series category', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ mediaType: 'tv', id: 2, title: 'Show B' })]);

    render(
      <InfinitePosterGrid
        mediaType='tv'
        initialPage={1}
        initialItems={[createMediaItem({ mediaType: 'tv', id: 1, title: 'Show A' })]}
        category='now_playing'
        locale='en'
      />,
    );
    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('poster-card')).toHaveLength(2));
    expect(fetchMedia).toHaveBeenCalledWith('tv', 'now_playing', 2, 'en', undefined);
  });

  it('keeps the filters when loading more movies', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ id: 2, title: 'Film B' })]);

    render(
      <InfinitePosterGrid
        mediaType='movie'
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
      <InfinitePosterGrid
        mediaType='movie'
        initialPage={1}
        initialItems={[createMediaItem({ id: 1, title: 'Film A' })]}
        category='popular'
        locale='en'
      />,
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
