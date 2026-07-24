import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { Movie } from '@/src/lib/api/tmdb/types';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie({ title: 'Inception' });

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

  it('closes the dialog on Escape and returns focus to the trigger', async () => {
    render(<MovieCard movie={movieMock} />);
    const trigger = screen.getByRole('button', { name: 'Inception' });

    await userEvent.click(trigger);
    expect(screen.getByTestId('movie-dialog-mock')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByTestId('movie-dialog-mock')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('ignores other key presses while the dialog is open', async () => {
    render(<MovieCard movie={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));
    await userEvent.keyboard('a');

    expect(screen.getByTestId('movie-dialog-mock')).toBeInTheDocument();
  });
});
