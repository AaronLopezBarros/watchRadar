'use client';

import { useRef, useState } from 'react';

import { useSearch } from '@/src/components/SearchBar/SearchProvider';
import { cn } from '@/src/lib/utils';

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_DELAY_MS = 350;

export function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { setDebouncedQuery } = useSearch();

  const handleChange = (value: string) => {
    setText(value);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      setDebouncedQuery(trimmed.length >= MIN_QUERY_LENGTH ? trimmed : '');
    }, DEBOUNCE_DELAY_MS);
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    clearTimeout(debounceRef.current);
    setIsOpen(false);
    setText('');
    setDebouncedQuery('');
  };

  if (!isOpen) {
    return (
      <button
        type='button'
        onClick={handleOpen}
        aria-label='Search movies'
        className='flex shrink-0 items-center justify-center rounded-full bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
      >
        <SearchIcon />
      </button>
    );
  }

  return (
    <div className='flex min-w-0 flex-1 items-center gap-1.5 rounded-full bg-white/10 pr-1 pl-3'>
      <SearchIcon className='shrink-0 text-white/40' />
      <input
        type='text'
        value={text}
        onChange={event => handleChange(event.target.value)}
        placeholder='Search movies…'
        className='min-w-0 flex-1 bg-transparent py-1.5 text-sm text-white placeholder:text-white/40 focus:outline-none'
      />
      <button
        type='button'
        onClick={handleClose}
        aria-label='Close search'
        className='flex shrink-0 items-center justify-center rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className={cn('h-4 w-4', className)}>
      <circle cx='11' cy='11' r='7' />
      <line x1='21' y1='21' x2='16.65' y2='16.65' />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className='h-4 w-4'>
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
  );
}
