import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tmdbClient } from '@/src/lib/api/tmdb/client';

const fetchMock = vi.spyOn(global, 'fetch').mockResolvedValue({
  ok: true,
  json: vi.fn().mockResolvedValue({}),
} as unknown as Response);

describe('tmdbClient', () => {
  beforeEach(() => {
    vi.stubEnv('TMDB_TOKEN', 'test-token');
  });

  it('calls fetch with the correct url and headers', async () => {
    await tmdbClient('/movie/popular');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/popular',
      expect.objectContaining({
        headers: expect.objectContaining({
          accept: 'application/json',
          Authorization: 'Bearer test-token',
        }),
        next: { revalidate: 3600 },
      }),
    );
  });

  it('calls fetch with the correct params', async () => {
    await tmdbClient('/movie/popular', {
      params: {
        page: 2,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/popular?page=2',
      expect.objectContaining({
        headers: expect.objectContaining({
          accept: 'application/json',
          Authorization: 'Bearer test-token',
        }),
        next: { revalidate: 3600 },
      }),
    );
  });

  it('calls fetch without params when there is no value', async () => {
    await tmdbClient('/movie/popular', {
      params: {
        page: undefined,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.themoviedb.org/3/movie/popular',
      expect.objectContaining({
        headers: expect.objectContaining({
          accept: 'application/json',
          Authorization: 'Bearer test-token',
        }),
        next: { revalidate: 3600 },
      }),
    );
  });

  it('throws when token is missing', async () => {
    delete process.env.TMDB_TOKEN;
    delete process.env.TMDB_API_KEY;

    await expect(tmdbClient('/movie/popular')).rejects.toThrow();
  });

  it('throws when response is not ok', async () => {
    process.env.TMDB_TOKEN = 'test-token';

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(tmdbClient('/movie/popular')).rejects.toThrow('TMDB API Error');
  });
});
