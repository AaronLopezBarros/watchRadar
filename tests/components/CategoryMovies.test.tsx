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
    locale,
  }: {
    initialMovies: unknown[];
    initialPage: number;
    category: string;
    locale: string;
  }) => (
    <div
      data-testid='infinite-grid'
      data-page={initialPage}
      data-count={initialMovies.length}
      data-category={category}
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
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 1, 'en');
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 2, 'en');
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 3, 'en');
    expect(grid).toHaveAttribute('data-page', '3');
    expect(grid).toHaveAttribute('data-count', '4');
    expect(grid).toHaveAttribute('data-category', 'top_rated');
    expect(grid).toHaveAttribute('data-locale', 'en');
  });
});
