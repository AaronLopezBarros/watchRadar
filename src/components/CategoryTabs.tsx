import Link from 'next/link';

import { MOVIE_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory } from '@/lib/api/tmdb/types';
import { cn } from '@/src/lib/utils';

type CategoryTabsProps = {
  active: MovieCategory;
};

export function CategoryTabs({ active }: CategoryTabsProps) {
  return (
    <nav className='scrollbar-hidden flex justify-center gap-2 px-5 pt-6'>
      {MOVIE_CATEGORIES.map(({ value, label }) => (
        <Link
          key={value}
          href={value === 'popular' ? '/' : `/?category=${value}`}
          scroll={false}
          aria-current={value === active ? 'true' : undefined}
          className={cn(
            'shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors',
            value === active ? 'bg-white/20 font-medium text-white' : 'bg-white/5 text-white/60 hover:bg-white/10',
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
