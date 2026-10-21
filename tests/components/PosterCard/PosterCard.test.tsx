import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PosterCard } from '@/components/PosterCard/PosterCard';
import type { MediaItem } from '@/lib/api/tmdb/types';
import { createMediaItem } from '@/tests/factories/media.factory';

const movieMock = createMediaItem({ id: 27205, title: 'Inception' });

vi.mock('@/components/PosterCard/ImageCard', () => ({
  ImageCard: ({ item }: { item: MediaItem }) => <div>{item.backdrop_path}</div>,
}));

const fetchProviders = vi.fn();

vi.mock('@/components/PosterCard/hooks/useWatchProviders', () => ({
  useWatchProviders: () => ({ providers: [], isLoading: false, fetchProviders }),
}));

vi.mock('@/components/PosterCard/PosterDialog', () => ({
  PosterDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid='poster-dialog-mock'>
      <button type='button' onClick={onClose}>
        close
      </button>
    </div>
  ),
}));

describe('PosterCard', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    fetchProviders.mockClear();
    cleanup();
  });

  it('renders a focusable button with the movie title as its accessible name', () => {
    render(<PosterCard item={movieMock} />);

    expect(screen.getByRole('button', { name: 'Inception' })).toBeInTheDocument();
  });

  it('does not render the dialog before the card is activated', () => {
    render(<PosterCard item={movieMock} />);

    expect(screen.queryByTestId('poster-dialog-mock')).not.toBeInTheDocument();
  });

  it('opens the dialog and fetches providers on click', async () => {
    render(<PosterCard item={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));

    expect(screen.getByTestId('poster-dialog-mock')).toBeInTheDocument();
    expect(fetchProviders).toHaveBeenCalledOnce();
  });

  it('reflects the open state through aria-expanded', async () => {
    render(<PosterCard item={movieMock} />);
    const trigger = screen.getByRole('button', { name: 'Inception' });

    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the dialog when onClose is called', async () => {
    render(<PosterCard item={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));
    await userEvent.click(screen.getByText('close'));

    expect(screen.queryByTestId('poster-dialog-mock')).not.toBeInTheDocument();
  });

  it('returns focus to the card when the dialog closes', async () => {
    render(<PosterCard item={movieMock} />);
    const trigger = screen.getByRole('button', { name: 'Inception' });

    await userEvent.click(trigger);
    await userEvent.click(screen.getByText('close'));

    expect(trigger).toHaveFocus();
  });

  it('puts the open movie in the URL keeping the category and filters', async () => {
    window.history.replaceState(null, '', '/?category=top_rated&genre=horror');
    render(<PosterCard item={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));

    expect(window.location.search).toBe('?category=top_rated&genre=horror&movie=27205');
  });

  it('puts the open series in the URL under its own param, and removes it on close', async () => {
    window.history.replaceState(null, '', '/?type=tv');
    render(<PosterCard item={createMediaItem({ mediaType: 'tv', id: 1399, title: 'Juego de tronos' })} />);

    await userEvent.click(screen.getByRole('button', { name: 'Juego de tronos' }));
    expect(window.location.search).toBe('?type=tv&tv=1399');

    await userEvent.click(screen.getByText('close'));
    expect(window.location.search).toBe('?type=tv');
  });

  it('removes the movie from the URL when the dialog closes', async () => {
    window.history.replaceState(null, '', '/?category=top_rated');
    render(<PosterCard item={movieMock} />);

    await userEvent.click(screen.getByRole('button', { name: 'Inception' }));
    await userEvent.click(screen.getByText('close'));

    expect(window.location.search).toBe('?category=top_rated');
  });
});
