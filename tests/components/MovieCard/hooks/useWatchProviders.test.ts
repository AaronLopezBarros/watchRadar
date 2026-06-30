import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovieWatchProviders } from '@/src/app/actions';
import { useWatchProviders } from '@/src/components/MovieCard/hooks/useWatchProviders';
import { createProvider } from '@/tests/factories/movie.factory';

vi.mock('@/src/app/actions');

describe('useWatchProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when disabled', () => {
    renderHook(() => useWatchProviders(1, false));

    expect(fetchMovieWatchProviders).not.toHaveBeenCalled();
  });

  it('fetches and returns flatrate providers for ES when enabled', async () => {
    const providers = [createProvider()];
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '', flatrate: providers } },
    });

    const { result } = renderHook(() => useWatchProviders(1, true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual(providers);
  });

  it('returns empty array when flatrate is missing', async () => {
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '' } },
    });

    const { result } = renderHook(() => useWatchProviders(1, true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('returns empty array on fetch error', async () => {
    vi.mocked(fetchMovieWatchProviders).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWatchProviders(1, true));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('only fetches once even when enabled toggles', async () => {
    vi.mocked(fetchMovieWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '', flatrate: [] } },
    });

    const { rerender } = renderHook(({ enabled }) => useWatchProviders(1, enabled), {
      initialProps: { enabled: true },
    });

    await waitFor(() => expect(vi.mocked(fetchMovieWatchProviders)).toHaveBeenCalledTimes(1));

    rerender({ enabled: false });
    rerender({ enabled: true });

    expect(vi.mocked(fetchMovieWatchProviders)).toHaveBeenCalledTimes(1);
  });
});
