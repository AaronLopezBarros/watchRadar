'use client';

import { useEffect, useRef, type ReactNode } from 'react';

import { useDragToClose } from '@/components/BottomSheet/hooks/useDragToClose';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import { useExitAnimation } from '@/lib/hooks/useExitAnimation';
import { cn } from '@/lib/utils';

const SCROLL_LOCK_CLASS_NAME = 'max-sm:overflow-hidden';

const TONE_CLASS_NAME = {
  light: { panel: 'bg-white', handle: 'bg-zinc-300' },
  dark: { panel: 'bg-slate-950', handle: 'bg-white/20' },
};

const CLOSING_CLASS_NAME = {
  // Same length as the panel's: the sheet unmounts when the panel's animation ends.
  backdrop: 'animate-[fade-out_250ms_ease-in_forwards] sm:animate-[fade-out_150ms_ease-in_forwards]',
  panel: 'animate-[slide-down_250ms_ease-in_forwards] sm:animate-[fade-out_150ms_ease-in_forwards]',
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
  const panelRef = useRef<HTMLDivElement>(null);
  const { isExiting: isClosing, startExit: requestClose, handleAnimationEnd } = useExitAnimation(panelRef, onClose);
  const { dragY, isDragging, handleTouchStart, handleTouchEnd, handleTouchCancel } = useDragToClose(
    panelRef,
    requestClose,
  );

  useEscapeKey(requestClose);

  useEffect(() => {
    document.body.classList.add(SCROLL_LOCK_CLASS_NAME);
    return () => document.body.classList.remove(SCROLL_LOCK_CLASS_NAME);
  }, []);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-end justify-center',
        DESKTOP_CLASS_NAME[desktop].container,
        isClosing && 'pointer-events-none',
      )}
    >
      <div
        data-testid='bottom-sheet-backdrop'
        className={cn(
          'fixed inset-0 animate-[fade-in_300ms_ease-out] bg-black/50 max-sm:touch-none',
          DESKTOP_CLASS_NAME[desktop].backdrop,
          isClosing && CLOSING_CLASS_NAME.backdrop,
          'motion-reduce:animate-none sm:motion-reduce:animate-none',
        )}
        onClick={event => {
          event.stopPropagation();
          requestClose();
        }}
      />
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-label={label}
        className={cn(
          'relative z-10 w-full animate-[slide-up_300ms_ease-out] rounded-t-2xl max-sm:touch-none',
          TONE_CLASS_NAME[tone].panel,
          DESKTOP_CLASS_NAME[desktop].panel,
          isClosing && CLOSING_CLASS_NAME.panel,
          'motion-reduce:animate-none sm:motion-reduce:animate-none',
          className,
        )}
        style={{ transform: `translateY(${dragY}px)`, transition: isDragging ? 'none' : 'transform 200ms ease-out' }}
        onClick={event => event.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className='flex justify-center pt-3 pb-4 sm:hidden'>
          <div className={cn('h-1 w-10 rounded-full', TONE_CLASS_NAME[tone].handle)} />
        </div>
        {children}
      </div>
    </div>
  );
}
