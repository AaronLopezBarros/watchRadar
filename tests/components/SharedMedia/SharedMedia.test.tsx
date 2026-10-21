import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SharedMedia } from '@/components/SharedMedia/SharedMedia';
import { fetchMediaDetails, fetchWatchProviders } from '@/lib/api/tmdb/actions';
import { createMediaItem, createProvider } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMediaDetails: vi.fn(),
  fetchWatchProviders: vi.fn(),
}));

describe('SharedMedia', () => {
  it('opens the movie in the given locale with its streaming providers', async () => {
    vi.mocked(fetchMediaDetails).mockResolvedValue(createMediaItem({ id: 27205, title: 'Origen' }));
    vi.mocked(fetchWatchProviders).mockResolvedValue({
      id: 27205,
      results: { ES: { link: '', flatrate: [createProvider({ provider_name: 'Netflix' })] } },
    });

    render(await SharedMedia({ sharedMedia: { mediaType: 'movie', id: 27205 }, locale: 'es' }));

    expect(fetchMediaDetails).toHaveBeenCalledWith('movie', 27205, 'es');
    expect(fetchWatchProviders).toHaveBeenCalledWith('movie', 27205);
    expect(screen.getByRole('dialog', { name: 'Origen' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('opens a shared series, not the movie with the same id', async () => {
    vi.mocked(fetchMediaDetails).mockResolvedValue(
      createMediaItem({ mediaType: 'tv', id: 1399, title: 'Juego de tronos' }),
    );
    vi.mocked(fetchWatchProviders).mockResolvedValue({ id: 1399, results: {} });

    render(await SharedMedia({ sharedMedia: { mediaType: 'tv', id: 1399 }, locale: 'es' }));

    expect(fetchMediaDetails).toHaveBeenCalledWith('tv', 1399, 'es');
    expect(fetchWatchProviders).toHaveBeenCalledWith('tv', 1399);
    expect(screen.getByRole('dialog', { name: 'Juego de tronos' })).toBeInTheDocument();
  });

  it('still opens the movie when the providers request fails', async () => {
    vi.mocked(fetchMediaDetails).mockResolvedValue(createMediaItem({ title: 'Origen' }));
    vi.mocked(fetchWatchProviders).mockRejectedValue(new Error('TMDB down'));

    render(await SharedMedia({ sharedMedia: { mediaType: 'movie', id: 27205 }, locale: 'en' }));

    expect(screen.getByRole('dialog', { name: 'Origen' })).toBeInTheDocument();
    expect(screen.getByText('Not available for streaming')).toBeInTheDocument();
  });

  it('renders nothing for a movie TMDB does not know', async () => {
    vi.mocked(fetchMediaDetails).mockRejectedValue(new Error('TMDB API Error /movie/999: Error 404'));
    vi.mocked(fetchWatchProviders).mockRejectedValue(new Error('TMDB API Error'));

    expect(await SharedMedia({ sharedMedia: { mediaType: 'movie', id: 999 }, locale: 'en' })).toBeNull();
  });
});
