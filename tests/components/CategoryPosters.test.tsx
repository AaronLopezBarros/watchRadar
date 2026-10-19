import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fetchMedia } from '@/lib/api/tmdb/actions';
import { CategoryPosters } from '@/src/components/CategoryPosters';
import { createMediaItem } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMedia: vi.fn(),
  fetchWatchProviders: vi.fn(),
}));

vi.mock('@/src/components/InfinitePosterGrid/InfinitePosterGrid', () => ({
  InfinitePosterGrid: ({
    initialItems,
    initialPage,
    mediaType,
    category,
    filters,
    locale,
  }: {
    initialItems: unknown[];
    initialPage: number;
    mediaType: string;
    category: string;
    filters?: { genre?: string; streaming?: boolean };
    locale: string;
  }) => (
    <div
      data-testid='infinite-grid'
      data-page={initialPage}
      data-count={initialItems.length}
      data-media-type={mediaType}
      data-category={category}
      data-genre={filters?.genre}
      data-streaming={filters?.streaming}
      data-locale={locale}
    />
  ),
}));

describe('CategoryPosters', () => {
  it('fetches the first 3 pages in parallel for the given category/locale and passes combined results to InfinitePosterGrid', async () => {
    const page1 = [createMediaItem({ id: 1 }), createMediaItem({ id: 2 })];
    const page2 = [createMediaItem({ id: 3 })];
    const page3 = [createMediaItem({ id: 4 })];
    vi.mocked(fetchMedia).mockImplementation(async (_mediaType, _category, page) => {
      if (page === 1) return page1;
      if (page === 2) return page2;
      return page3;
    });

    render(await CategoryPosters({ mediaType: 'movie', category: 'top_rated', locale: 'en' }));

    const grid = screen.getByTestId('infinite-grid');
    expect(fetchMedia).toHaveBeenCalledWith('movie', 'top_rated', 1, 'en', undefined);
    expect(fetchMedia).toHaveBeenCalledWith('movie', 'top_rated', 2, 'en', undefined);
    expect(fetchMedia).toHaveBeenCalledWith('movie', 'top_rated', 3, 'en', undefined);
    expect(grid).toHaveAttribute('data-page', '3');
    expect(grid).toHaveAttribute('data-count', '4');
    expect(grid).toHaveAttribute('data-category', 'top_rated');
    expect(grid).toHaveAttribute('data-locale', 'en');
  });

  it('fetches and forwards the active filters', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ id: 1 })]);
    const filters = { genre: 'horror' as const, streaming: true };

    render(await CategoryPosters({ mediaType: 'movie', category: 'popular', filters, locale: 'en' }));

    expect(fetchMedia).toHaveBeenCalledWith('movie', 'popular', 1, 'en', filters);
    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-genre', 'horror');
    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-streaming', 'true');
  });

  it('drops movies repeated across the initial pages', async () => {
    vi.mocked(fetchMedia).mockImplementation(async (_mediaType, _category, page) =>
      page === 1
        ? [createMediaItem({ id: 1 }), createMediaItem({ id: 2 })]
        : [createMediaItem({ id: 2 }), createMediaItem({ id: 3 })],
    );

    render(
      await CategoryPosters({ mediaType: 'movie', category: 'popular', filters: { genre: 'horror' }, locale: 'en' }),
    );

    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-count', '3');
  });

  it('shows an empty state when no movie matches the filters', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([]);

    render(
      await CategoryPosters({
        mediaType: 'movie',
        category: 'now_playing',
        filters: { genre: 'romance' },
        locale: 'es',
      }),
    );

    expect(screen.getByText('No hay películas con estos filtros.')).toBeInTheDocument();
    expect(screen.queryByTestId('infinite-grid')).not.toBeInTheDocument();
  });

  it('fetches series for a series category', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([createMediaItem({ mediaType: 'tv', id: 1399 })]);

    render(await CategoryPosters({ mediaType: 'tv', category: 'now_playing', locale: 'en' }));

    expect(fetchMedia).toHaveBeenCalledWith('tv', 'now_playing', 1, 'en', undefined);
    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-media-type', 'tv');
  });

  it('keeps a movie and a series that share an id', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([
      createMediaItem({ mediaType: 'movie', id: 1 }),
      createMediaItem({ mediaType: 'tv', id: 1 }),
    ]);

    render(await CategoryPosters({ mediaType: 'movie', category: 'popular', locale: 'en' }));

    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-count', '2');
  });

  it('names series in the empty state', async () => {
    vi.mocked(fetchMedia).mockResolvedValue([]);

    render(await CategoryPosters({ mediaType: 'tv', category: 'upcoming', locale: 'es' }));

    expect(screen.getByText('No hay series con estos filtros.')).toBeInTheDocument();
  });
});
