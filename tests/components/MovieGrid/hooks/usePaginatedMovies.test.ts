import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { usePaginatedMovies } from '@/src/components/MovieGrid/hooks/usePaginatedMovies';
import { createMovie } from '@/tests/factories/movie.factory';

describe('usePaginatedMovies', () => {
  it('starts with the initial movies and isLoading false by default', () => {
    const initialMovies = [createMovie({ id: 1 })];
    const { result } = renderHook(() =>
      usePaginatedMovies({ initialMovies, initialPage: 1, fetchPage: vi.fn() }),
    );

    expect(result.current.movies).toEqual(initialMovies);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(false);
  });

  it('starts with isLoading true when startLoading is set', () => {
    const { result } = renderHook(() =>
      usePaginatedMovies({ initialMovies: [], initialPage: 0, fetchPage: vi.fn(), startLoading: true }),
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('fetches the next page and appends the results', async () => {
    const initialMovies = [createMovie({ id: 1 })];
    const fetchPage = vi.fn().mockResolvedValue([createMovie({ id: 2 })]);
    const { result } = renderHook(() => usePaginatedMovies({ initialMovies, initialPage: 1, fetchPage }));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchPage).toHaveBeenCalledWith(2);
    expect(result.current.movies).toEqual([...initialMovies, createMovie({ id: 2 })]);
  });

  it('filters out movies that were already seen', async () => {
    const initialMovies = [createMovie({ id: 1 })];
    const fetchPage = vi.fn().mockResolvedValue([createMovie({ id: 1 }), createMovie({ id: 2 })]);
    const { result } = renderHook(() => usePaginatedMovies({ initialMovies, initialPage: 1, fetchPage }));

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.movies).toEqual([createMovie({ id: 1 }), createMovie({ id: 2 })]);
  });

  it('ignores a second loadMore call while the first one is still in flight', async () => {
    // eslint-disable-next-line no-unused-vars -- `movies` names the parameter for documentation, TS function types require a name
    let resolveFetch: ((movies: ReturnType<typeof createMovie>[]) => void) | undefined;
    const fetchPage = vi.fn().mockImplementation(
      () =>
        new Promise(resolve => {
          resolveFetch = resolve;
        }),
    );
    const { result } = renderHook(() =>
      usePaginatedMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, fetchPage }),
    );

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(fetchPage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch?.([createMovie({ id: 2 })]);
    });
  });

  it('sets error to true and stops loading when the fetch rejects', async () => {
    const fetchPage = vi.fn().mockRejectedValue(new Error('boom'));
    const { result } = renderHook(() =>
      usePaginatedMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, fetchPage }),
    );

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe(true);
  });

  it('clears the error once a following loadMore call succeeds', async () => {
    const fetchPage = vi
      .fn()
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValueOnce([createMovie({ id: 2 })]);
    const { result } = renderHook(() =>
      usePaginatedMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, fetchPage }),
    );

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.error).toBe(true));

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe(false);
  });
});
