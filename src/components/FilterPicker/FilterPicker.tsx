'use client';

import { ChevronDownIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { MOVIE_GENRES, STREAMING_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieFilters } from '@/lib/api/tmdb/types';
import { buildHomeHref, cn } from '@/lib/utils';
import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';
import { useTranslations } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';

const ALL_GENRES_OPTION = undefined;

type FilterPickerProps = {
  category: MovieCategory;
  filters: MovieFilters;
};

export function FilterPicker({ category, filters }: FilterPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isSearchOpen } = useSearch();
  const dict = useTranslations();
  const { genre, streaming } = filters;
  const canFilterStreaming = STREAMING_CATEGORIES.includes(category);
  const activeLabels = [genre && dict.genre[genre], streaming && dict.filters.streaming].filter(Boolean);
  const hasActiveFilters = activeLabels.length > 0;

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleSelect = () => {
    setIsOpen(false);
    window.scrollTo({ top: 0 });
  };

  // /search/movie supports none of these filters, so the picker steps aside while a search is open.
  if (isSearchOpen) return null;

  return (
    <div className='relative flex min-w-0 items-center gap-1.5'>
      <button
        ref={triggerRef}
        type='button'
        onClick={() => setIsOpen(true)}
        aria-label={hasActiveFilters ? `${dict.filters.title}: ${activeLabels.join(', ')}` : undefined}
        aria-expanded={isOpen}
        aria-haspopup='dialog'
        className={cn(
          'flex h-11 min-w-0 cursor-pointer items-center gap-1.5 rounded-full px-4 text-xs transition-colors md:text-sm',
          hasActiveFilters
            ? 'bg-white/20 font-medium text-white'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
        )}
      >
        <span className='truncate'>{hasActiveFilters ? activeLabels.join(' · ') : dict.filters.title}</span>
        <ChevronDownIcon className='h-3.5 w-3.5 shrink-0' />
      </button>
      {hasActiveFilters && (
        <Link
          href={buildHomeHref({ category })}
          onClick={handleSelect}
          aria-label={dict.filters.clearAriaLabel}
          className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/60 transition-colors hover:bg-white/10 hover:text-white'
        >
          <XIcon className='h-3.5 w-3.5' />
        </Link>
      )}
      {isOpen && (
        <BottomSheet
          label={dict.filters.title}
          onClose={handleClose}
          tone='dark'
          desktop='popover'
          className='px-4 pb-8 sm:left-0 sm:p-3 md:right-0 md:left-auto'
        >
          <h2 className='mb-4 text-base font-semibold text-white sm:sr-only'>{dict.filters.title}</h2>
          {canFilterStreaming && (
            // Toggling streaming keeps the sheet open so a genre can still be picked in the same visit.
            <Link
              href={buildHomeHref({ category, genre, streaming: !streaming })}
              role='switch'
              aria-checked={Boolean(streaming)}
              className='mb-4 flex min-h-11 items-center justify-between rounded-xl bg-white/5 px-4 text-sm text-white transition-colors hover:bg-white/10'
            >
              {dict.filters.streamingOnly}
              <span
                aria-hidden='true'
                className={cn(
                  'flex h-6 w-10 items-center rounded-full p-0.5 transition-colors',
                  streaming ? 'justify-end bg-[#05d9e8]' : 'justify-start bg-white/20',
                )}
              >
                <span className='h-5 w-5 rounded-full bg-white' />
              </span>
            </Link>
          )}
          <h3 className='mb-2 text-xs font-medium tracking-wide text-white/40 uppercase'>{dict.filters.genres}</h3>
          <ul className='grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain'>
            {[ALL_GENRES_OPTION, ...MOVIE_GENRES].map(value => (
              <li key={value ?? 'all'}>
                <Link
                  href={buildHomeHref({ category, genre: value, streaming })}
                  onClick={handleSelect}
                  aria-current={value === genre ? 'true' : undefined}
                  className={cn(
                    'flex min-h-11 items-center rounded-xl px-4 text-sm transition-colors',
                    value === genre
                      ? 'bg-white/20 font-medium text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {value ? dict.genre[value] : dict.filters.allGenres}
                </Link>
              </li>
            ))}
          </ul>
        </BottomSheet>
      )}
    </div>
  );
}
