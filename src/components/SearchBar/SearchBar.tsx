'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { MediaType } from '@/lib/api/tmdb/types';
import { useEscapeKey } from '@/lib/hooks/useEscapeKey';
import { useExitAnimation } from '@/lib/hooks/useExitAnimation';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY_MS = 350;

type SearchBarProps = {
  mediaType: MediaType;
};

export function SearchBar({ mediaType }: SearchBarProps) {
  const [text, setText] = useState('');
  const { setDebouncedQuery, isSearchOpen: isOpen, setIsSearchOpen: setIsOpen } = useSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const refocusTriggerRef = useRef(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const dict = useTranslations();

  const handleChange = (value: string) => {
    setText(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      window.scrollTo({ top: 0 });

      setDebouncedQuery(trimmed.length >= MIN_QUERY_LENGTH ? trimmed : '');
    }, DEBOUNCE_DELAY_MS);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const close = useCallback(() => {
    clearTimeout(debounceRef.current);
    setIsOpen(false);
    setText('');
    setDebouncedQuery('');
  }, [setDebouncedQuery, setIsOpen]);

  const { isExiting: isClosing, startExit: handleClose, handleAnimationEnd } = useExitAnimation(fieldRef, close);

  const closeAndRefocus = useCallback(() => {
    refocusTriggerRef.current = true;
    handleClose();
  }, [handleClose]);

  useEscapeKey(closeAndRefocus, isOpen);

  useEffect(() => {
    if (isOpen || !refocusTriggerRef.current) return;
    refocusTriggerRef.current = false;
    triggerRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) {
    return (
      <button
        ref={triggerRef}
        type='button'
        onClick={handleOpen}
        aria-label={dict.search.openAriaLabel[mediaType]}
        className='flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
      >
        <SearchIcon className='h-4 w-4 shrink-0' />
      </button>
    );
  }

  return (
    <div
      ref={fieldRef}
      className={cn(
        'flex min-w-0 flex-1 animate-[search-in_200ms_ease-out] items-center gap-1.5 rounded-full bg-white/10 pl-3',
        isClosing && 'pointer-events-none animate-[search-out_150ms_ease-in_forwards]',
        'motion-reduce:animate-none',
      )}
      onAnimationEnd={handleAnimationEnd}
    >
      <SearchIcon className='h-4 w-4 shrink-0 text-white/40' />
      <input
        type='text'
        value={text}
        onChange={event => handleChange(event.target.value)}
        placeholder={dict.search.placeholder[mediaType]}
        autoFocus
        // iOS zooms into any input under 16px when it gets focus.
        className='min-w-0 flex-1 bg-transparent py-1.5 text-base text-white placeholder:text-white/40 focus:outline-none'
      />
      <button
        type='button'
        onClick={handleClose}
        aria-label={dict.search.closeAriaLabel}
        className='flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white'
      >
        <XIcon className='h-4 w-4' />
      </button>
    </div>
  );
}
