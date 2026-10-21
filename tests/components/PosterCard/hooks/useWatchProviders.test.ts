import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchWatchProviders } from '@/lib/api/tmdb/actions';
import { useWatchProviders } from '@/src/components/PosterCard/hooks/useWatchProviders';
import { createProvider } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchWatchProviders: vi.fn(),
}));

describe('useWatchProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch before fetchProviders is called', () => {
    renderHook(() => useWatchProviders('movie', 1));

    expect(fetchWatchProviders).not.toHaveBeenCalled();
  });

  it('fetches and returns flatrate providers for ES when fetchProviders is called', async () => {
    const providers = [createProvider()];
    vi.mocked(fetchWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '', flatrate: providers } },
    });

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchWatchProviders).toHaveBeenCalledWith('movie', 1);
    expect(result.current.providers).toEqual(providers);
  });

  it('returns empty array when flatrate is missing', async () => {
    vi.mocked(fetchWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '' } },
    });

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('returns empty array on fetch error', async () => {
    vi.mocked(fetchWatchProviders).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('only fetches once even if fetchProviders is called multiple times', async () => {
    vi.mocked(fetchWatchProviders).mockResolvedValue({
      id: 1,
      results: { ES: { link: '', flatrate: [] } },
    });

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
      result.current.fetchProviders();
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(fetchWatchProviders)).toHaveBeenCalledTimes(1);
  });
});
