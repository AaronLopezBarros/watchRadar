'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useTranslations } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY_MS = 350;

export function SearchBar() {
  const [text, setText] = useState('');
  const { setDebouncedQuery, isSearchOpen: isOpen, setIsSearchOpen: setIsOpen } = useSearch();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const refocusTriggerRef = useRef(false);
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

  const handleClose = useCallback(() => {
    clearTimeout(debounceRef.current);
    setIsOpen(false);
    setText('');
    setDebouncedQuery('');
  }, [setDebouncedQuery, setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      refocusTriggerRef.current = true;
      handleClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

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
        aria-label={dict.search.openAriaLabel}
        className='flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
      >
        <SearchIcon className='h-4 w-4 shrink-0' />
      </button>
    );
  }

  return (
    <div className='flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white/10 pl-3'>
      <SearchIcon className='h-4 w-4 shrink-0 text-white/40' />
      <input
        type='text'
        value={text}
        onChange={event => handleChange(event.target.value)}
        placeholder={dict.search.placeholder}
        autoFocus
        className='min-w-0 flex-1 bg-transparent py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none'
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
