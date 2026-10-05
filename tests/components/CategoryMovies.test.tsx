import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import { CategoryMovies } from '@/src/components/CategoryMovies';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMovies: vi.fn(),
  fetchMovieWatchProviders: vi.fn(),
}));

vi.mock('@/src/components/InfiniteMovieGrid/InfiniteMovieGrid', () => ({
  InfiniteMovieGrid: ({
    initialMovies,
    initialPage,
    category,
    filters,
    locale,
  }: {
    initialMovies: unknown[];
    initialPage: number;
    category: string;
    filters?: { genre?: string; streaming?: boolean };
    locale: string;
  }) => (
    <div
      data-testid='infinite-grid'
      data-page={initialPage}
      data-count={initialMovies.length}
      data-category={category}
      data-genre={filters?.genre}
      data-streaming={filters?.streaming}
      data-locale={locale}
    />
  ),
}));

describe('CategoryMovies', () => {
  it('fetches the first 3 pages in parallel for the given category/locale and passes combined results to InfiniteMovieGrid', async () => {
    const page1 = [createMovie({ id: 1 }), createMovie({ id: 2 })];
    const page2 = [createMovie({ id: 3 })];
    const page3 = [createMovie({ id: 4 })];
    vi.mocked(fetchMovies).mockImplementation(async (_category, page) => {
      if (page === 1) return page1;
      if (page === 2) return page2;
      return page3;
    });

    render(await CategoryMovies({ category: 'top_rated', locale: 'en' }));

    const grid = screen.getByTestId('infinite-grid');
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 1, 'en', undefined);
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 2, 'en', undefined);
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 3, 'en', undefined);
    expect(grid).toHaveAttribute('data-page', '3');
    expect(grid).toHaveAttribute('data-count', '4');
    expect(grid).toHaveAttribute('data-category', 'top_rated');
    expect(grid).toHaveAttribute('data-locale', 'en');
  });

  it('fetches and forwards the active filters', async () => {
    vi.mocked(fetchMovies).mockResolvedValue([createMovie({ id: 1 })]);
    const filters = { genre: 'horror' as const, streaming: true };

    render(await CategoryMovies({ category: 'popular', filters, locale: 'en' }));

    expect(fetchMovies).toHaveBeenCalledWith('popular', 1, 'en', filters);
    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-genre', 'horror');
    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-streaming', 'true');
  });

  it('drops movies repeated across the initial pages', async () => {
    vi.mocked(fetchMovies).mockImplementation(async (_category, page) =>
      page === 1 ? [createMovie({ id: 1 }), createMovie({ id: 2 })] : [createMovie({ id: 2 }), createMovie({ id: 3 })],
    );

    render(await CategoryMovies({ category: 'popular', filters: { genre: 'horror' }, locale: 'en' }));

    expect(screen.getByTestId('infinite-grid')).toHaveAttribute('data-count', '3');
  });

  it('shows an empty state when no movie matches the filters', async () => {
    vi.mocked(fetchMovies).mockResolvedValue([]);

    render(await CategoryMovies({ category: 'now_playing', filters: { genre: 'romance' }, locale: 'es' }));

    expect(screen.getByText('No hay películas con estos filtros.')).toBeInTheDocument();
    expect(screen.queryByTestId('infinite-grid')).not.toBeInTheDocument();
  });
});
