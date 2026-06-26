import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useMovieCardHover } from '@/src/components/MovieCard/hooks/useMovieCardHover';

const OPTIONS = { delay: 200, expandedWidth: 380, expandedHeight: 320 };

describe('useMovieCardHover', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with isHovered false', () => {
    const { result } = renderHook(() => useMovieCardHover({ current: null }, OPTIONS));

    expect(result.current.isHovered).toBe(false);
  });

  it('sets isHovered to true only after the delay', () => {
    const { result } = renderHook(() => useMovieCardHover({ current: null }, OPTIONS));

    act(() => result.current.handleMouseEnter());
    expect(result.current.isHovered).toBe(false);

    act(() => vi.advanceTimersByTime(OPTIONS.delay));
    expect(result.current.isHovered).toBe(true);
  });

  it('sets isHovered to false immediately on mouse leave', () => {
    const { result } = renderHook(() => useMovieCardHover({ current: null }, OPTIONS));

    act(() => result.current.handleMouseEnter());
    act(() => vi.advanceTimersByTime(OPTIONS.delay));

    act(() => result.current.handleMouseLeave());
    expect(result.current.isHovered).toBe(false);
  });

  it('cancels the hover if mouse leaves before delay completes', () => {
    const { result } = renderHook(() => useMovieCardHover({ current: null }, OPTIONS));

    act(() => result.current.handleMouseEnter());
    act(() => result.current.handleMouseLeave());
    act(() => vi.advanceTimersByTime(OPTIONS.delay));

    expect(result.current.isHovered).toBe(false);
  });

  it('clears the timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { result, unmount } = renderHook(() => useMovieCardHover({ current: null }, OPTIONS));

    act(() => result.current.handleMouseEnter());
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
