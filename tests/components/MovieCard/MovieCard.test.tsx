import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { Movie } from '@/src/lib/api/tmdb/types';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie({ id: 27205, title: 'Inception' });

vi.mock('@/src/components/MovieCard/ImageCard', () => ({
  ImageCard: ({ movie }: { movie: Movie }) => <div>{movie.backdrop_path}</div>,
}));

const fetchProviders = vi.fn();

vi.mock('@/src/components/MovieCard/hooks/useWatchProviders', () => ({
  useWatchProviders: () => ({ providers: [], isLoading: false, fetchProviders }),
}));

vi.mock('@/src/components/MovieCard/MovieDialog', () => ({
  MovieDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid='movie-dialog-mock'>
      <button type='button' onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

describe('MovieCard', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    fetchProviders.mockClear();
    cleanup();
  });

  it('renders a focusable button with the movie title as its accessible name', () => {
    render(<MovieCard movie={movieMock} />);

    expect(screen.getByRole('button', { name: 'Inception' })).toBeInTheDocument();
  });

  it('does not render the dialog before the card is activated', () => {
    render(<MovieCard movie={movieMock} />);

    expect(screen.queryByTestId('movie-dialog-mock')).not.toBeInTheDocument();
  });

  it('opens the dialog and fetches providers on click', async () => {
    render(<MovieCard movie={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));

    expect(screen.getByTestId('movie-dialog-mock')).toBeInTheDocument();
    expect(fetchProviders).toHaveBeenCalledOnce();
  });

  it('reflects the open state through aria-expanded', async () => {
    render(<MovieCard movie={movieMock} />);
    const trigger = screen.getByRole('button', { name: 'Inception' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the dialog when onClose is called', async () => {
    render(<MovieCard movie={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));
    await userEvent.click(screen.getByText('close'));

    expect(screen.queryByTestId('movie-dialog-mock')).not.toBeInTheDocument();
  });

  it('returns focus to the card when the dialog closes', async () => {
    render(<MovieCard movie={movieMock} />);
    const trigger = screen.getByRole('button', { name: 'Inception' });

    await userEvent.click(trigger);
    await userEvent.click(screen.getByText('close'));

    expect(trigger).toHaveFocus();
  });

  it('puts the open movie in the URL keeping the category and filters', async () => {
    window.history.replaceState(null, '', '/?category=top_rated&genre=horror');
    render(<MovieCard movie={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));

    expect(window.location.search).toBe('?category=top_rated&genre=horror&movie=27205');
  });

  it('removes the movie from the URL when the dialog closes', async () => {
    window.history.replaceState(null, '', '/?category=top_rated');
    render(<MovieCard movie={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));
    await userEvent.click(screen.getByText('close'));

    expect(window.location.search).toBe('?category=top_rated');
  });
});
