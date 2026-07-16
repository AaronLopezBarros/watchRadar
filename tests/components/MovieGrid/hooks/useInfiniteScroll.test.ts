import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useInfiniteScroll } from '@/src/components/MovieGrid/hooks/useInfiniteScroll';

describe('useInfiniteScroll', () => {
  let observerCallback: IntersectionObserverCallback | undefined;
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  const triggerIntersection = (isIntersecting: boolean) =>
    observerCallback!([{ isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver);

  beforeEach(() => {
    observerCallback = undefined;
    observeMock = vi.fn();
    disconnectMock = vi.fn();

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb;
        }
        observe = observeMock;
        disconnect = disconnectMock;
      },
    );
  });

  it('observes the sentinel and calls onIntersect when it intersects', () => {
    const onIntersect = vi.fn();
    const sentinel = document.createElement('div');
    const sentinelRef = { current: sentinel };

    renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect }));

    expect(observeMock).toHaveBeenCalledWith(sentinel);

    act(() => triggerIntersection(true));

    expect(onIntersect).toHaveBeenCalledOnce();
  });

  it('does not call onIntersect when the sentinel is not intersecting', () => {
    const onIntersect = vi.fn();
    const sentinelRef = { current: document.createElement('div') };

    renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect }));
    act(() => triggerIntersection(false));

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it('disconnects the observer on unmount', () => {
    const sentinelRef = { current: document.createElement('div') };

    const { unmount } = renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect: vi.fn() }));
    unmount();

    expect(disconnectMock).toHaveBeenCalledOnce();
  });

  it('does not create an observer when the sentinel ref is null', () => {
    const sentinelRef = { current: null };

    renderHook(() => useInfiniteScroll(sentinelRef, { onIntersect: vi.fn() }));

    expect(observeMock).not.toHaveBeenCalled();
    expect(observerCallback).toBeUndefined();
  });
});
