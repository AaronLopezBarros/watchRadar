'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';

import { MOVIE_GENRES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';
import { buildHomeHref, cn } from '@/lib/utils';
import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';
import { useTranslations } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';

const ALL_GENRES_OPTION = undefined;

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

  // /search/movie can't filter by genre, so the picker steps aside while a search is open.
  if (isSearchOpen) return null;

  return (
    <div className='relative flex items-center gap-1.5'>
      <button
        ref={triggerRef}
        type='button'
        onClick={() => setIsOpen(true)}
        aria-label={genre && `${dict.genrePicker.title}: ${dict.genre[genre]}`}
        aria-expanded={isOpen}
        aria-haspopup='dialog'
        className={cn(
          'flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs transition-colors md:text-sm',
          genre ? 'bg-white/20 font-medium text-white' : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
        )}
      >
        {genre ? dict.genre[genre] : dict.genrePicker.title}
        <ChevronIcon />
      </button>
      {genre && (
        <Link
          href={buildHomeHref({ category })}
          onClick={handleSelect}
          aria-label={dict.genrePicker.clearAriaLabel}
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
        >
          <CloseIcon />
        </Link>
      )}
      {isOpen && (
        <BottomSheet
          label={dict.genrePicker.title}
          onClose={handleClose}
          tone='dark'
          desktop='popover'
          className='px-4 pb-8 sm:left-0 sm:p-3 md:right-0 md:left-auto'
        >
          <h2 className='mb-4 text-base font-semibold text-white sm:sr-only'>{dict.genrePicker.title}</h2>
          <ul className='grid max-h-[60vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain'>
            {[ALL_GENRES_OPTION, ...MOVIE_GENRES].map(value => (
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
                  {value ? dict.genre[value] : dict.genrePicker.all}
                </Link>
              </li>
            ))}
          </ul>
        </BottomSheet>
      )}
    </div>
  );
}
