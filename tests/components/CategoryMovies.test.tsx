import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import { CategoryMovies } from '@/src/components/CategoryMovies';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMovies: vi.fn(),
  fetchMovieWatchProviders: vi.fn(),
}));

vi.mock('@/src/components/InfiniteMovieGrid', () => ({
  InfiniteMovieGrid: ({
    initialMovies,
    initialPage,
    category,
  }: {
    initialMovies: unknown[];
    initialPage: number;
    category: string;
  }) => (
    <div data-testid='infinite-grid' data-page={initialPage} data-count={initialMovies.length} data-category={category} />
  ),
}));

describe('CategoryMovies', () => {
  it('fetches page 1 for the given category and passes results to InfiniteMovieGrid', async () => {
    const movies = [createMovie({ id: 1 }), createMovie({ id: 2 })];
    vi.mocked(fetchMovies).mockResolvedValue(movies);

    render(await CategoryMovies({ category: 'top_rated' }));

    const grid = screen.getByTestId('infinite-grid');
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 1);
    expect(grid).toHaveAttribute('data-page', '1');
    expect(grid).toHaveAttribute('data-count', '2');
    expect(grid).toHaveAttribute('data-category', 'top_rated');
  });
});
