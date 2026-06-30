import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovieWatchProviders } from '@/src/app/actions';
import { useWatchProviders } from '@/src/components/MovieCard/hooks/useWatchProviders';
import { createProvider } from '@/tests/factories/movie.factory';

vi.mock('@/src/app/actions');

describe('useWatchProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch before fetchProviders is called', () => {
    renderHook(() => useWatchProviders(1));

    expect(fetchMovieWatchProviders).not.toHaveBeenCalled();
  });

  it('fetches and returns flatrate providers for ES when fetchProviders is called', async () => {
    const providers = [createProvider()];
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '', flatrate: providers } },
    });

    const { result } = renderHook(() => useWatchProviders(1));

    act(() => { result.current.fetchProviders(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual(providers);
  });

  it('returns empty array when flatrate is missing', async () => {
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '' } },
    });

    const { result } = renderHook(() => useWatchProviders(1));

    act(() => { result.current.fetchProviders(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('returns empty array on fetch error', async () => {
    vi.mocked(fetchMovieWatchProviders).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWatchProviders(1));

    act(() => { result.current.fetchProviders(); });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('only fetches once even if fetchProviders is called multiple times', async () => {
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '', flatrate: [] } },
    });

    const { result } = renderHook(() => useWatchProviders(1));

    act(() => {
      result.current.fetchProviders();
      result.current.fetchProviders();
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(fetchMovieWatchProviders)).toHaveBeenCalledTimes(1);
  });
});
