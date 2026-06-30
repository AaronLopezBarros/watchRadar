import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useIsTouchDevice } from '@/src/components/MovieCard/hooks/useIsTouchDevice';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useIsTouchDevice', () => {
  it('returns false when matchMedia is not available', () => {
    const { result } = renderHook(() => useIsTouchDevice());

    expect(result.current).toBe(false);
  });

  it('returns false when the device supports hover', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: false }));

    const { result } = renderHook(() => useIsTouchDevice());

    expect(result.current).toBe(false);
  });

  it('returns true when the device does not support hover', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));

    const { result } = renderHook(() => useIsTouchDevice());

    expect(result.current).toBe(true);
  });
});
