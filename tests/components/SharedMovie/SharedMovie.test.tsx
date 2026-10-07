import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { fetchMovieDetails, fetchMovieWatchProviders } from '@/lib/api/tmdb/actions';
import { SharedMovie } from '@/src/components/SharedMovie/SharedMovie';
import { createMovie, createProvider } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMovieDetails: vi.fn(),
  fetchMovieWatchProviders: vi.fn(),
}));

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('SharedMovie', () => {
  it('opens the movie in the given locale with its streaming providers', async () => {
    vi.mocked(fetchMovieDetails).mockResolvedValue(createMovie({ id: 27205, title: 'Origen' }));
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 27205,
      results: { ES: { link: '', flatrate: [createProvider({ provider_name: 'Netflix' })] } },
    });

    render(await SharedMovie({ movieId: 27205, locale: 'es' }));

    expect(fetchMovieDetails).toHaveBeenCalledWith(27205, 'es');
    expect(screen.getByRole('dialog', { name: 'Origen' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('still opens the movie when the providers request fails', async () => {
    vi.mocked(fetchMovieDetails).mockResolvedValue(createMovie({ title: 'Origen' }));
    vi.mocked(fetchMovieWatchProviders).mockRejectedValue(new Error('TMDB down'));

    render(await SharedMovie({ movieId: 27205, locale: 'en' }));

    expect(screen.getByRole('dialog', { name: 'Origen' })).toBeInTheDocument();
    expect(screen.getByText('Not available for streaming')).toBeInTheDocument();
  });

  it('renders nothing for a movie TMDB does not know', async () => {
    vi.mocked(fetchMovieDetails).mockRejectedValue(new Error('TMDB API Error /movie/999: Error 404'));
    vi.mocked(fetchMovieWatchProviders).mockRejectedValue(new Error('TMDB API Error'));

    expect(await SharedMovie({ movieId: 999, locale: 'en' })).toBeNull();
  });
});
