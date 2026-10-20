'use client';

import Link from 'next/link';

import { MEDIA_TYPES } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaType } from '@/lib/api/tmdb/types';
import { buildHomeHref, cn } from '@/lib/utils';
import { useTranslations } from '@/src/components/LocaleProvider';
import { useSearch } from '@/src/components/SearchBar/SearchProvider';

type MediaTypeToggleProps = {
  active: MediaType;
  category: MediaCategory;
  streaming?: boolean;
};

export function MediaTypeToggle({ active, category, streaming }: MediaTypeToggleProps) {
  const dict = useTranslations();
  const { isSearchOpen } = useSearch();

  // An open search takes the toggle's room; it searches within the active media type.
  if (isSearchOpen) return null;

  // Switching keeps the tab and streaming, which every media type shares, but not the genre: genres differ by type.
  return (
    <div role='group' aria-label={dict.mediaType.groupAriaLabel} className='flex shrink-0 rounded-full bg-white/5'>
      {MEDIA_TYPES.map(value => (
        <Link
          key={value}
          href={buildHomeHref({ mediaType: value, category, streaming })}
          aria-current={value === active ? 'true' : undefined}
          className={cn(
            'flex min-h-11 items-center justify-center rounded-full px-3 text-xs transition-colors md:px-4 md:text-sm',
            value === active
              ? 'bg-white/20 font-medium text-white'
              : 'text-white/60 hover:bg-white/10 hover:text-white',
          )}
        >
          {dict.mediaType[value]}
        </Link>
      ))}
    </div>
  );
}
