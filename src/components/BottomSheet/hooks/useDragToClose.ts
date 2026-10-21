'use client';

import { useCallback, useEffect, useRef, useState, type RefObject, type TouchEvent as ReactTouchEvent } from 'react';

const DRAG_CLOSE_THRESHOLD_PX = 100;
// iOS sends moves of a few pixels, in either direction, at the start of any swipe.
const DIRECTION_SLOP_PX = 8;
// From here up the sheet is a centered modal or a popover anchored to its trigger: neither should move.
const DESKTOP_MEDIA_QUERY = '(min-width: 40rem)';

type DragGesture = { startY: number; isDragging: boolean; distance: number };

const isInsideScrolledContent = (target: EventTarget | null, container: HTMLElement) => {
  for (
    let element = target instanceof Element ? target : null;
    element && element !== container;
    element = element.parentElement
  ) {
    if (element.scrollTop > 0) return true;
  }
  return false;
};

export function useDragToClose(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const gestureRef = useRef<DragGesture | null>(null);

  const handleTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    const canDrag =
      !window.matchMedia(DESKTOP_MEDIA_QUERY).matches && !isInsideScrolledContent(event.target, event.currentTarget);
    gestureRef.current = canDrag ? { startY: event.touches[0].clientY, isDragging: false, distance: 0 } : null;
  };

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const deltaY = event.touches[0].clientY - gesture.startY;
    if (!gesture.isDragging) {
      if (Math.abs(deltaY) < DIRECTION_SLOP_PX) return;
      if (deltaY < 0) {
        gestureRef.current = null;
        return;
      }
      gesture.isDragging = true;
    }

    event.preventDefault();
    gesture.distance = Math.max(0, deltaY);
    setIsDragging(true);
    setDragY(gesture.distance);
  }, []);

  const endGesture = (canClose: boolean) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture?.isDragging) return;
    setIsDragging(false);
    if (canClose && gesture.distance > DRAG_CLOSE_THRESHOLD_PX) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => endGesture(true);
  // The system cancelled the touch (an iOS edge gesture, an incoming call): the person didn't let go to close.
  const handleTouchCancel = () => endGesture(false);

  // React registers touchmove as passive, so it couldn't stop a list from scrolling when a pull down at its top should
  // drag the element instead.
  useEffect(() => {
    const element = ref.current;
    element?.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => element?.removeEventListener('touchmove', handleTouchMove);
  }, [ref, handleTouchMove]);

  return { dragY, isDragging, handleTouchStart, handleTouchEnd, handleTouchCancel };
}
