import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInfiniteScroll } from '@/src/components/InfiniteMovieGrid/hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let observerCallback: IntersectionObserverCallback | undefined;
  let observerOptions: IntersectionObserverInit | undefined;
  let observe: ReturnType<typeof vi.fn>;
  let disconnect: ReturnType<typeof vi.fn>;
  const sentinelRef = { current: document.createElement('div') };

  const triggerIntersection = (isIntersecting: boolean) =>
    observerCallback!([{ isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver);

  beforeEach(() => {
    observerCallback = undefined;
    observerOptions = undefined;
    observe = vi.fn();
    disconnect = vi.fn();
    const capturedObserve = observe;
    const capturedDisconnect = disconnect;

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          observerCallback = cb;
          observerOptions = options;
        }
        observe = capturedObserve;
        disconnect = capturedDisconnect;
      },
    );
  });

  it('observes the sentinel with the given rootMargin', () => {
    renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect: vi.fn(), rootMargin: '300px' }));

    expect(observe).toHaveBeenCalledWith(sentinelRef.current);
    expect(observerOptions).toEqual({ rootMargin: '300px' });
  });

  it('calls onIntersect when the sentinel intersects', () => {
    const onIntersect = vi.fn();
    renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect }));

    act(() => triggerIntersection(true));

    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it('does not call onIntersect when the sentinel is not intersecting', () => {
    const onIntersect = vi.fn();
    renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect }));

    act(() => triggerIntersection(false));

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('recreates the observer when resetKey changes', () => {
    const { rerender } = renderHook(
      ({ resetKey }) => useInfiniteScroll(sentinelRef, { onIntersect: vi.fn(), resetKey }),
      { initialProps: { resetKey: 1 } },
    );

    rerender({ resetKey: 2 });

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it('does not recreate the observer when resetKey stays the same', () => {
    const onIntersect = vi.fn();
    const { rerender } = renderHook(({ resetKey }) => useInfiniteScroll(sentinelRef, { onIntersect, resetKey }), {
      initialProps: { resetKey: 1 },
    });

    rerender({ resetKey: 1 });

    expect(disconnect).not.toHaveBeenCalled();
    expect(observe).toHaveBeenCalledTimes(1);
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect: vi.fn() }));

    unmount();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
