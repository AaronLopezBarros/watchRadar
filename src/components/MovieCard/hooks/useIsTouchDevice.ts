'use client';

import { useState } from 'react';

export function useIsTouchDevice() {
  const [isTouch] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(hover: none)').matches;
  });

  return isTouch;
}
