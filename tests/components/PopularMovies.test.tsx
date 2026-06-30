import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fetchPopularMovies } from '@/lib/api/tmdb/actions';
import { PopularMovies } from '@/src/components/PopularMovies';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchPopularMovies: vi.fn(),
  fetchMovieWatchProviders: vi.fn(),
}));

vi.mock('@/src/components/InfiniteMovieGrid', () => ({
  InfiniteMovieGrid: ({ initialMovies, initialPage }: { initialMovies: unknown[]; initialPage: number }) => (
    <div data-testid='infinite-grid' data-page={initialPage} data-count={initialMovies.length} />
  ),
}));

describe('PopularMovies', () => {
  it('fetches page 1 and passes results to InfiniteMovieGrid', async () => {
    const movies = [createMovie({ id: 1 }), createMovie({ id: 2 })];
    vi.mocked(fetchPopularMovies).mockResolvedValue(movies);

    render(await PopularMovies());

    const grid = screen.getByTestId('infinite-grid');
    expect(fetchPopularMovies).toHaveBeenCalledWith(1);
    expect(grid).toHaveAttribute('data-page', '1');
    expect(grid).toHaveAttribute('data-count', '2');
  });
});
