'use client';

import Link from 'next/link';

import { FilterPicker } from '@/components/FilterPicker/FilterPicker';
import { useTranslations } from '@/components/LocaleProvider';
import { MediaTypeToggle } from '@/components/MediaTypeToggle/MediaTypeToggle';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { MEDIA_CATEGORIES } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaFilters, MediaType } from '@/lib/api/tmdb/types';
import { useOptimisticNavigation } from '@/lib/hooks/useOptimisticNavigation';
import { buildHomeHref, cn } from '@/lib/utils';

type CategoryTabsProps = {
  mediaType: MediaType;
  active: MediaCategory;
  filters?: MediaFilters;
};

export function CategoryTabs({ mediaType, active, filters = {} }: CategoryTabsProps) {
  const dict = useTranslations();
  const [activeCategory, categoryLinkProps] = useOptimisticNavigation(active);

  return (
    <nav className='sticky top-0 z-30 flex flex-col gap-2 px-5 pt-4 pb-3 md:flex-row md:items-center'>
      {/* The blur lives on its own layer: backdrop-filter on the nav itself would make it the containing
          block for `fixed` descendants and trap the filter sheet inside the nav. */}
      <div aria-hidden='true' className='absolute inset-0 -z-10 backdrop-blur-md' />
      <div className='flex min-w-0 flex-1 gap-1.5 md:justify-center'>
        {MEDIA_CATEGORIES.map(value => (
          <Link
            key={value}
            {...categoryLinkProps(value, buildHomeHref({ mediaType, category: value, ...filters }))}
            aria-current={value === activeCategory ? 'true' : undefined}
            className={cn(
              'flex min-h-11 min-w-0 flex-1 items-center justify-center truncate rounded-full px-1.5 text-center text-xs transition-colors md:flex-none md:px-4 md:text-sm',
              value === activeCategory
                ? 'bg-white/20 font-medium text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
            )}
          >
            {dict.category[value]}
          </Link>
        ))}
      </div>
      <div className='flex items-center justify-end gap-2'>
        <div className='mr-auto min-w-0'>
          <FilterPicker mediaType={mediaType} category={active} filters={filters} />
        </div>
        <SearchBar mediaType={mediaType} />
        <MediaTypeToggle active={mediaType} category={active} streaming={filters.streaming} />
      </div>
    </nav>
  );
}
