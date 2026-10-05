'use client';

import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';

import { MOVIE_GENRES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';
import { buildHomeHref, cn } from '@/lib/utils';
import { useTranslations } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';

const SCROLL_LOCK_CLASS_NAME = 'max-sm:overflow-hidden';

const CHIP_CLASS_NAME =
  'flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs transition-colors md:text-sm';

function ChevronIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className='h-3.5 w-3.5'>
      <polyline points='6 9 12 15 18 9' />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth={2} className='h-3.5 w-3.5'>
      <line x1='18' y1='6' x2='6' y2='18' />
      <line x1='6' y1='6' x2='18' y2='18' />
    </svg>
  );
}

type GenrePickerProps = {
  category: MovieCategory;
  genre?: MovieGenre;
};

export function GenrePicker({ category, genre }: GenrePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const { isSearchOpen } = useSearch();
  const dict = useTranslations();

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelect = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    document.body.classList.add(SCROLL_LOCK_CLASS_NAME);

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove(SCROLL_LOCK_CLASS_NAME);
    };
  }, [isOpen]);

  // /search/movie can't filter by genre, so the picker steps aside while a search is open.
  if (isSearchOpen) return null;

  const options: { value?: MovieGenre; label: string }[] = [
    { value: undefined, label: dict.genrePicker.all },
    ...MOVIE_GENRES.map(value => ({ value, label: dict.genre[value] })),
  ];

  return (
    <div className='relative'>
      {genre ? (
        <div className='flex shrink-0 items-center gap-1.5'>
          <button
            ref={triggerRef}
            type='button'
            onClick={() => setIsOpen(true)}
            aria-label={`${dict.genrePicker.title}: ${dict.genre[genre]}`}
            aria-expanded={isOpen}
            aria-haspopup='dialog'
            className={cn(CHIP_CLASS_NAME, 'bg-white/20 font-medium text-white')}
          >
            {dict.genre[genre]}
            <ChevronIcon />
          </button>
          <Link
            href={buildHomeHref({ category })}
            onClick={handleSelect}
            aria-label={dict.genrePicker.clearAriaLabel}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
          >
            <CloseIcon />
          </Link>
        </div>
      ) : (
        <button
          ref={triggerRef}
          type='button'
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-haspopup='dialog'
          className={cn(CHIP_CLASS_NAME, 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white')}
        >
          {dict.genrePicker.title}
          <ChevronIcon />
        </button>
      )}
      {isOpen && (
        <>
          <div
            data-testid='genre-picker-backdrop'
            className='fixed inset-0 z-40 animate-[fade-in_300ms_ease-out] bg-black/50 sm:animate-none sm:bg-transparent'
            onClick={handleClose}
          />
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby={titleId}
            className='fixed inset-x-0 bottom-0 z-50 animate-[slide-up_300ms_ease-out] rounded-t-2xl bg-slate-950 px-4 pt-3 pb-8 sm:absolute sm:inset-x-auto sm:top-full sm:bottom-auto sm:left-0 sm:mt-2 sm:w-80 sm:animate-[fade-in_150ms_ease-out] sm:rounded-2xl sm:p-3 sm:shadow-lg md:right-0 md:left-auto'
          >
            <div className='mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden' />
            <h2 id={titleId} className='mb-4 text-base font-semibold text-white sm:sr-only'>
              {dict.genrePicker.title}
            </h2>
            <ul className='grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain'>
              {options.map(({ value, label }) => (
                <li key={value ?? 'all'}>
                  <Link
                    href={buildHomeHref({ category, genre: value })}
                    onClick={handleSelect}
                    aria-current={value === genre ? 'true' : undefined}
                    className={cn(
                      'flex min-h-11 items-center rounded-xl px-4 text-sm transition-colors',
                      value === genre
                        ? 'bg-white/20 font-medium text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
