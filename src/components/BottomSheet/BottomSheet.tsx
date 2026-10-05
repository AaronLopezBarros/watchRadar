'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

const DRAG_CLOSE_THRESHOLD_PX = 100;
const SCROLL_LOCK_CLASS_NAME = 'max-sm:overflow-hidden';

const TONE_CLASS_NAME = {
  light: { panel: 'bg-white', handle: 'bg-zinc-300' },
  dark: { panel: 'bg-slate-950', handle: 'bg-white/20' },
};

const DESKTOP_CLASS_NAME = {
  modal: {
    container: 'sm:items-center sm:p-4',
    backdrop: '',
    panel: 'sm:max-w-md sm:animate-[fade-in_200ms_ease-out] sm:rounded-2xl',
  },
  // `sm:contents` drops the full-screen container so the panel anchors to the nearest positioned ancestor
  // (the trigger's wrapper); the backdrop stays as an invisible click-outside catcher.
  popover: {
    container: 'sm:contents',
    backdrop: 'sm:animate-none sm:bg-transparent',
    panel: 'sm:absolute sm:top-full sm:mt-2 sm:w-80 sm:animate-[fade-in_150ms_ease-out] sm:rounded-2xl sm:shadow-lg',
  },
};

type BottomSheetProps = {
  label: string;
  onClose: () => void;
  tone: keyof typeof TONE_CLASS_NAME;
  desktop: keyof typeof DESKTOP_CLASS_NAME;
  className?: string;
  children: ReactNode;
};

export function BottomSheet({ label, onClose, tone, desktop, className, children }: BottomSheetProps) {
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartYRef = useRef(0);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.classList.add(SCROLL_LOCK_CLASS_NAME);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove(SCROLL_LOCK_CLASS_NAME);
    };
  }, [onClose]);

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartYRef.current = event.clientY;
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setDragY(Math.max(0, event.clientY - dragStartYRef.current));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (dragY > DRAG_CLOSE_THRESHOLD_PX) {
      onClose();
    } else {
      setDragY(0);
    }
  };

  return (
    <div className={cn('fixed inset-0 z-50 flex items-end justify-center', DESKTOP_CLASS_NAME[desktop].container)}>
      <div
        data-testid='bottom-sheet-backdrop'
        className={cn(
          'fixed inset-0 animate-[fade-in_300ms_ease-out] bg-black/50',
          DESKTOP_CLASS_NAME[desktop].backdrop,
        )}
        onClick={event => {
          event.stopPropagation();
          onClose();
        }}
      />
      <div
        role='dialog'
        aria-modal='true'
        aria-label={label}
        className={cn(
          'relative z-10 w-full animate-[slide-up_300ms_ease-out] rounded-t-2xl',
          TONE_CLASS_NAME[tone].panel,
          DESKTOP_CLASS_NAME[desktop].panel,
          className,
        )}
        style={{ transform: `translateY(${dragY}px)`, transition: isDragging ? 'none' : 'transform 200ms ease-out' }}
        onClick={event => event.stopPropagation()}
      >
        <div
          data-testid='bottom-sheet-drag-handle'
          className='flex touch-none justify-center pt-3 pb-4 sm:hidden'
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
          onPointerCancel={handleDragEnd}
        >
          <div className={cn('h-1 w-10 rounded-full', TONE_CLASS_NAME[tone].handle)} />
        </div>
        {children}
      </div>
    </div>
  );
}
