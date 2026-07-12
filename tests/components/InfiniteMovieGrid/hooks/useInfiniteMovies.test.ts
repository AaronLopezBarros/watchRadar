import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchMovies } from '@/lib/api/tmdb/actions';
import { useInfiniteMovies } from '@/src/components/InfiniteMovieGrid/hooks/useInfiniteMovies';
import { createMovie } from '@/tests/factories/movie.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  fetchMovies: vi.fn(),
}));

describe('useInfiniteMovies', () => {
  beforeEach(() => {
    vi.mocked(fetchMovies).mockReset();
  });

  it('starts with the initial movies and not loading', () => {
    const movies = [createMovie({ id: 1 }), createMovie({ id: 2 })];
    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: movies, initialPage: 1, category: 'popular' }),
    );

    expect(result.current.movies).toEqual(movies);
    expect(result.current.isLoading).toBe(false);
  });

  it('fetches the next page for the given category on loadMore', async () => {
    vi.mocked(fetchMovies).mockResolvedValue([createMovie({ id: 2, title: 'Film B' })]);

    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, category: 'top_rated' }),
    );

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.movies).toHaveLength(2));
    expect(fetchMovies).toHaveBeenCalledWith('top_rated', 2);
  });

  it('deduplicates movies already loaded', async () => {
    vi.mocked(fetchMovies).mockResolvedValue([createMovie({ id: 1 }), createMovie({ id: 2 })]);

    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, category: 'popular' }),
    );

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.movies).toHaveLength(2));
    expect(result.current.movies.map(movie => movie.id)).toEqual([1, 2]);
  });

  it('sets isLoading while a fetch is in flight', async () => {
    vi.mocked(fetchMovies).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, category: 'popular' }),
    );

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
  });

  it('clears isLoading once the fetch resolves', async () => {
    vi.mocked(fetchMovies).mockResolvedValue([]);

    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, category: 'popular' }),
    );

    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  it('prevents concurrent loads', () => {
    vi.mocked(fetchMovies).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, category: 'popular' }),
    );

    act(() => {
      result.current.loadMore();
      result.current.loadMore();
    });

    expect(fetchMovies).toHaveBeenCalledTimes(1);
  });

  it('advances the page after each successful load', async () => {
    vi.mocked(fetchMovies)
      .mockResolvedValueOnce([createMovie({ id: 2 })])
      .mockResolvedValueOnce([createMovie({ id: 3 })]);

    const { result } = renderHook(() =>
      useInfiniteMovies({ initialMovies: [createMovie({ id: 1 })], initialPage: 1, category: 'popular' }),
    );

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.movies).toHaveLength(2));

    act(() => {
      result.current.loadMore();
    });
    await waitFor(() => expect(result.current.movies).toHaveLength(3));

    expect(fetchMovies).toHaveBeenNthCalledWith(1, 'popular', 2);
    expect(fetchMovies).toHaveBeenNthCalledWith(2, 'popular', 3);
  });
});
