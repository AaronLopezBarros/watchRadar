'use client';

import Link from 'next/link';

import { useTranslations } from '@/components/LocaleProvider';
import { useSearch } from '@/components/SearchBar/SearchProvider';
import { MEDIA_TYPES } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaType } from '@/lib/api/tmdb/types';
import { useOptimisticNavigation } from '@/lib/hooks/useOptimisticNavigation';
import { buildHomeHref, cn } from '@/lib/utils';

type MediaTypeToggleProps = {
  active: MediaType;
  category: MediaCategory;
  streaming?: boolean;
};

export function MediaTypeToggle({ active, category, streaming }: MediaTypeToggleProps) {
  const dict = useTranslations();
  const { isSearchOpen } = useSearch();
  const [activeMediaType, mediaTypeLinkProps] = useOptimisticNavigation(active);

  // An open search takes the toggle's room; it searches within the active media type.
  if (isSearchOpen) return null;

  // Switching keeps the tab and streaming, which every media type shares, but not the genre: genres differ by type.
  return (
    <div
      role='group'
      aria-label={dict.mediaType.groupAriaLabel}
      className='flex shrink-0 animate-[fade-in_200ms_ease-out] rounded-full bg-white/5 motion-reduce:animate-none'
    >
      {MEDIA_TYPES.map(value => (
        <Link
          key={value}
          {...mediaTypeLinkProps(value, buildHomeHref({ mediaType: value, category, streaming }))}
          aria-current={value === activeMediaType ? 'true' : undefined}
          className={cn(
            'flex min-h-11 items-center justify-center rounded-full px-3 text-xs transition-colors md:px-4 md:text-sm',
            value === activeMediaType
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
