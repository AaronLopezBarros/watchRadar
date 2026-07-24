import Link from 'next/link';

import { MOVIE_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory } from '@/lib/api/tmdb/types';
import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';
import { LanguageSelector } from '@/src/components/LanguageSelector/LanguageSelector';
import { SearchBar } from '@/src/components/SearchBar/SearchBar';

type CategoryTabsProps = {
  active: MovieCategory;
  locale: Locale;
};

export function CategoryTabs({ active, locale }: CategoryTabsProps) {
  const dict = getDictionary(locale);

  return (
    <nav className='sticky top-0 z-30 flex flex-col gap-2 px-5 pt-4 pb-3 backdrop-blur-md md:flex-row md:items-center'>
      <div className='scrollbar-hidden flex min-w-0 flex-1 justify-start gap-2 overflow-x-auto sm:justify-center'>
        {MOVIE_CATEGORIES.map(value => (
          <Link
            key={value}
            href={value === 'popular' ? '/' : `/?category=${value}`}
            scroll={false}
            aria-current={value === active ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors',
              value === active
                ? 'bg-white/20 font-medium text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
            )}
          >
            {dict.category[value]}
          </Link>
        ))}
      </div>
      <div className='flex items-center justify-end gap-2'>
        <SearchBar />
        <LanguageSelector locale={locale} />
      </div>
    </nav>
  );
}
