'use client';

import { useCallback, useEffect, useRef, useState, type RefObject, type TouchEvent as ReactTouchEvent } from 'react';

const DRAG_CLOSE_THRESHOLD_PX = 100;

type DragGesture = { startY: number; hasMoved: boolean; distance: number };

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
    gestureRef.current = isInsideScrolledContent(event.target, event.currentTarget)
      ? null
      : { startY: event.touches[0].clientY, hasMoved: false, distance: 0 };
  };

  const handleTouchMove = useCallback((event: TouchEvent) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    const deltaY = event.touches[0].clientY - gesture.startY;
    if (!gesture.hasMoved) {
      gesture.hasMoved = true;
      // A first move upwards scrolls the content.
      if (deltaY < 0) {
        gestureRef.current = null;
        return;
      }
    }

    event.preventDefault();
    gesture.distance = Math.max(0, deltaY);
    setIsDragging(true);
    setDragY(gesture.distance);
  }, []);

  const handleTouchEnd = () => {
    const gesture = gestureRef.current;
    gestureRef.current = null;
    if (!gesture?.hasMoved) return;
    setIsDragging(false);
    if (gesture.distance > DRAG_CLOSE_THRESHOLD_PX) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  // React registers touchmove as passive, so it couldn't stop a list from scrolling when a pull down at its top should
  // drag the element instead.
  useEffect(() => {
    const element = ref.current;
    element?.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => element?.removeEventListener('touchmove', handleTouchMove);
  }, [ref, handleTouchMove]);

  return { dragY, isDragging, handleTouchStart, handleTouchEnd };
}
