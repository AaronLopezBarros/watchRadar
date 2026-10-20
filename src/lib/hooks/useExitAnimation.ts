'use client';

import { useCallback, useEffect, useState, type AnimationEvent, type RefObject } from 'react';

// Keeps an element mounted while its exit animation plays and calls onExited once it ends. The caller applies the
// exit animation class while `isExiting` is true and passes `handleAnimationEnd` to that same element.
export function useExitAnimation(ref: RefObject<HTMLElement | null>, onExited: () => void) {
  const [isExiting, setIsExiting] = useState(false);

  const startExit = useCallback(() => setIsExiting(true), []);

  // Reset for callers that stay mounted after the exit, so the next entrance doesn't start mid-exit.
  const finishExit = useCallback(() => {
    setIsExiting(false);
    onExited();
  }, [onExited]);

  // Without a running exit animation (reduced motion, or no Web Animations API) no animationend will come.
  useEffect(() => {
    if (!isExiting) return;
    const animations = ref.current?.getAnimations?.() ?? [];
    if (!animations.some(animation => 'animationName' in animation)) finishExit();
  }, [isExiting, finishExit, ref]);

  const handleAnimationEnd = (event: AnimationEvent<HTMLElement>) => {
    if (isExiting && event.target === event.currentTarget) finishExit();
  };

  return { isExiting, startExit, handleAnimationEnd };
}
