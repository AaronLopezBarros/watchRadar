'use client';

import { useEffect } from 'react';

// onEscape must be stable, or the listener is re-added on every render.
export function useEscapeKey(onEscape: () => void, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onEscape, isEnabled]);
}
