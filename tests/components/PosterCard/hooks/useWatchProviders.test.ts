import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useWatchProviders } from '@/components/PosterCard/hooks/useWatchProviders';
import { fetchStreamingProviders } from '@/lib/api/tmdb/actions';
import { createProvider } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchStreamingProviders: vi.fn(),
}));

describe('useWatchProviders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch before fetchProviders is called', () => {
    renderHook(() => useWatchProviders('movie', 1));

    expect(fetchStreamingProviders).not.toHaveBeenCalled();
  });

  it('fetches and returns the streaming providers when fetchProviders is called', async () => {
    const providers = [createProvider()];
    vi.mocked(fetchStreamingProviders).mockResolvedValue(providers);

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchStreamingProviders).toHaveBeenCalledWith('movie', 1);
    expect(result.current.providers).toEqual(providers);
  });

  it('returns empty array on fetch error', async () => {
    vi.mocked(fetchStreamingProviders).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.providers).toEqual([]);
  });

  it('only fetches once even if fetchProviders is called multiple times', async () => {
    vi.mocked(fetchStreamingProviders).mockResolvedValue([]);

    const { result } = renderHook(() => useWatchProviders('movie', 1));

    act(() => {
      result.current.fetchProviders();
      result.current.fetchProviders();
      result.current.fetchProviders();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(vi.mocked(fetchStreamingProviders)).toHaveBeenCalledTimes(1);
  });
});
