'use client';

import { ChevronDownIcon, XIcon } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';

import { BottomSheet } from '@/components/BottomSheet/BottomSheet';
import { useTranslations } from '@/components/LocaleProvider';
import { useSearch } from '@/components/SearchBar/SearchProvider';
import { MEDIA_CONFIG, canFilterStreaming } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaFilters, MediaType } from '@/lib/api/tmdb/types';
import { useOptimisticNavigation } from '@/lib/hooks/useOptimisticNavigation';
import { buildHomeHref, cn } from '@/lib/utils';

const ALL_GENRES_OPTION = undefined;

// Long enough to see the picked genre marked as current before the sheet slides away.
export const PICK_FEEDBACK_MS = 150;

type FilterPickerProps = {
  mediaType: MediaType;
  category: MediaCategory;
  filters: MediaFilters;
};

export function FilterPicker({ mediaType, category, filters }: FilterPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { isSearchOpen } = useSearch();
  const dict = useTranslations();
  const [activeFilters, linkProps] = useOptimisticNavigation(filters);
  const { genre, streaming } = activeFilters;
  const canFilterByStreaming = canFilterStreaming(mediaType, category);
  const activeLabels = [genre && dict.genre[genre], streaming && dict.filters.streaming].filter(Boolean);
  const hasActiveFilters = activeLabels.length > 0;

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const scrollToTop = () => window.scrollTo({ top: 0 });

  const filterLinkProps = (nextFilters: MediaFilters, onSelect?: () => void) =>
    linkProps(nextFilters, buildHomeHref({ mediaType, category, ...nextFilters }), onSelect);

  // TMDB search supports none of these filters, so the picker steps aside while a search is open.
  if (isSearchOpen) return null;

  return (
    <div className='relative flex min-w-0 animate-[fade-in_200ms_ease-out] items-center motion-reduce:animate-none'>
      {/* With filters on, the clear link sits inside the chip instead of the chevron: on narrow screens the room it
          saves is what keeps the active filter names readable next to the search and the media type toggle. */}
      <div
        className={cn(
          'flex h-11 min-w-0 items-center rounded-full transition-colors',
          hasActiveFilters
            ? 'bg-white/20 font-medium text-white'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
        )}
      >
        <button
          ref={triggerRef}
          type='button'
          onClick={() => setIsOpen(true)}
          aria-label={hasActiveFilters ? `${dict.filters.title}: ${activeLabels.join(', ')}` : undefined}
          aria-expanded={isOpen}
          aria-haspopup='dialog'
          className={cn(
            'flex h-full min-w-0 cursor-pointer items-center gap-1.5 text-xs md:text-sm',
            hasActiveFilters ? 'pl-4' : 'px-4',
          )}
        >
          <span className='truncate'>{hasActiveFilters ? activeLabels.join(' · ') : dict.filters.title}</span>
          {!hasActiveFilters && <ChevronDownIcon className='h-3.5 w-3.5 shrink-0' />}
        </button>
        {hasActiveFilters && (
          <Link
            {...filterLinkProps({}, scrollToTop)}
            aria-label={dict.filters.clearAriaLabel}
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white'
          >
            <XIcon className='h-3.5 w-3.5' />
          </Link>
        )}
      </div>
      {isOpen && (
        <BottomSheet
          label={dict.filters.title}
          onClose={handleClose}
          tone='dark'
          desktop='popover'
          className='px-4 pb-8 sm:left-0 sm:p-3 md:right-0 md:left-auto'
        >
          {({ close }) => (
            <>
              <h2 className='mb-4 text-base font-semibold text-white sm:sr-only'>{dict.filters.title}</h2>
              {canFilterByStreaming && (
                // Toggling streaming keeps the sheet open so a genre can still be picked in the same visit.
                <Link
                  {...filterLinkProps({ genre, streaming: !streaming })}
                  role='switch'
                  aria-checked={Boolean(streaming)}
                  className='mb-4 flex min-h-11 items-center justify-between rounded-xl bg-white/5 px-4 text-sm text-white transition-colors hover:bg-white/10'
                >
                  {dict.filters.streamingOnly}
                  <span
                    aria-hidden='true'
                    className={cn(
                      'flex h-6 w-10 items-center rounded-full p-0.5 transition-colors',
                      streaming ? 'justify-end bg-radar-cyan' : 'justify-start bg-white/20',
                    )}
                  >
                    <span className='h-5 w-5 rounded-full bg-white' />
                  </span>
                </Link>
              )}
              <h3 className='mb-2 text-xs font-medium tracking-wide text-white/40 uppercase'>{dict.filters.genres}</h3>
              <ul className='grid max-h-[50vh] grid-cols-2 gap-2 overflow-y-auto overscroll-contain'>
                {[ALL_GENRES_OPTION, ...MEDIA_CONFIG[mediaType].genres].map(value => (
                  <li key={value ?? 'all'}>
                    <Link
                      {...filterLinkProps({ genre: value, streaming }, () => {
                        scrollToTop();
                        setTimeout(close, PICK_FEEDBACK_MS);
                      })}
                      aria-current={value === genre ? 'true' : undefined}
                      className={cn(
                        'flex min-h-11 items-center rounded-xl px-4 text-sm transition active:scale-[0.97] active:bg-white/20',
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
            </>
          )}
        </BottomSheet>
      )}
    </div>
  );
}
