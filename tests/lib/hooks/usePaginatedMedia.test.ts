import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePaginatedMedia } from '@/src/lib/hooks/usePaginatedMedia';
import { createMediaItem } from '@/tests/factories/media.factory';

describe('usePaginatedMedia', () => {
  it('starts with the initial movies and isLoading false by default', () => {
    const initialItems = [createMediaItem({ id: 1 })];
    const { result } = renderHook(() => usePaginatedMedia({ initialItems, initialPage: 1, fetchPage: vi.fn() }));

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('starts with isLoading true when startLoading is set', () => {
    const { result } = renderHook(() =>
      usePaginatedMedia({ initialItems: [], initialPage: 0, fetchPage: vi.fn(), startLoading: true }),
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('fetches the first page on its own when startLoading is set, without waiting for loadNextPage to be called', async () => {
    const fetchPage = vi.fn().mockResolvedValue([createMediaItem({ id: 1 })]);
    const { result } = renderHook(() =>
      usePaginatedMedia({ initialItems: [], initialPage: 0, fetchPage, startLoading: true }),
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchPage).toHaveBeenCalledWith(1);
    expect(result.current.items).toEqual([createMediaItem({ id: 1 })]);
  });

  it('does not fetch on mount when startLoading is not set', () => {
    const fetchPage = vi.fn();
    renderHook(() => usePaginatedMedia({ initialItems: [], initialPage: 1, fetchPage }));

    expect(fetchPage).not.toHaveBeenCalled();
  });

  it('fetches the next page and appends the results', async () => {
    const initialItems = [createMediaItem({ id: 1 })];
    const fetchPage = vi.fn().mockResolvedValue([createMediaItem({ id: 2 })]);
    const { result } = renderHook(() => usePaginatedMedia({ initialItems, initialPage: 1, fetchPage }));

    act(() => {
      result.current.loadNextPage();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchPage).toHaveBeenCalledWith(2);
    expect(result.current.items).toEqual([...initialItems, createMediaItem({ id: 2 })]);
  });

  it('filters out movies that were already seen', async () => {
    const initialItems = [createMediaItem({ id: 1 })];
    const fetchPage = vi.fn().mockResolvedValue([createMediaItem({ id: 1 }), createMediaItem({ id: 2 })]);
    const { result } = renderHook(() => usePaginatedMedia({ initialItems, initialPage: 1, fetchPage }));

    act(() => {
      result.current.loadNextPage();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.items).toEqual([createMediaItem({ id: 1 }), createMediaItem({ id: 2 })]);
  });

  it('ignores a second loadNextPage call while the first one is still in flight', async () => {
    // eslint-disable-next-line no-unused-vars -- `movies` names the parameter for documentation, TS function types require a name
    let resolveFetch: ((movies: ReturnType<typeof createMediaItem>[]) => void) | undefined;
    const fetchPage = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        }),
    );
    const { result } = renderHook(() =>
      usePaginatedMedia({ initialItems: [createMediaItem({ id: 1 })], initialPage: 1, fetchPage }),
    );

    act(() => {
      result.current.loadNextPage();
      result.current.loadNextPage();
    });

    expect(fetchPage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch?.([createMediaItem({ id: 2 })]);
    });
  });

  it('sets error to true and stops loading when the fetch rejects', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() =>
      usePaginatedMedia({ initialItems: [createMediaItem({ id: 1 })], initialPage: 1, fetchPage }),
    );

    act(() => {
      result.current.loadNextPage();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(true);
  });

  it('clears the error once a following loadNextPage call succeeds', async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce([createMediaItem({ id: 2 })]);
    const { result } = renderHook(() =>
      usePaginatedMedia({ initialItems: [createMediaItem({ id: 1 })], initialPage: 1, fetchPage }),
    );

    act(() => {
      result.current.loadNextPage();
    });
    await waitFor(() => expect(result.current.error).toBe(true));

    act(() => {
      result.current.loadNextPage();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(false);
  });
});
