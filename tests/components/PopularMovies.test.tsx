import { render, screen } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { PopularMovies } from '@/src/components/PopularMovies';
import { getPopularMoviesMultiplePages } from '@/src/lib/api/tmdb/movies';
import { Movie } from '@/src/lib/api/tmdb/types';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/src/lib/api/tmdb/movies', () => ({
  getPopularMoviesMultiplePages: vi.fn(),
}));

vi.mock('@/src/components/MovieCard/MovieCard', () => ({
  MovieCard: ({ movie }: { movie: Movie }) => <div>{movie.title}</div>,
}));

describe('PopularMovies', () => {
  it('should render when it mounts', async () => {
    (getPopularMoviesMultiplePages as Mock).mockResolvedValue([createMovie()]);

    render(await PopularMovies());

    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });
});
