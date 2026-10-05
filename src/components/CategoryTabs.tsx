import Link from 'next/link';

import { MOVIE_CATEGORIES } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';
import { getDictionary } from '@/lib/i18n/dictionary';
import type { Locale } from '@/lib/i18n/locale';
import { buildHomeHref, cn } from '@/lib/utils';
import { GenrePicker } from '@/src/components/GenrePicker/GenrePicker';
import { LanguageSelector } from '@/src/components/LanguageSelector/LanguageSelector';
import { SearchBar } from '@/src/components/SearchBar/SearchBar';

type CategoryTabsProps = {
  active: MovieCategory;
  genre?: MovieGenre;
  locale: Locale;
};

export function CategoryTabs({ active, genre, locale }: CategoryTabsProps) {
  const dict = getDictionary(locale);

  return (
    <nav className='sticky top-0 z-30 flex flex-col gap-2 px-5 pt-4 pb-3 md:flex-row md:items-center'>
      {/* The blur lives on its own layer: backdrop-filter on the nav itself would make it the containing
          block for `fixed` descendants and trap the genre sheet inside the nav. */}
      <div aria-hidden='true' className='absolute inset-0 -z-10 backdrop-blur-md' />
      <div className='flex min-w-0 flex-1 gap-1.5 md:justify-center'>
        {MOVIE_CATEGORIES.map(value => (
          <Link
            key={value}
            href={buildHomeHref({ category: value, genre })}
            aria-current={value === active ? 'true' : undefined}
            className={cn(
              'flex min-h-11 min-w-0 flex-1 items-center justify-center truncate rounded-full px-1.5 text-center text-xs transition-colors md:flex-none md:px-4 md:text-sm',
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
        <div className='mr-auto'>
          <GenrePicker category={active} genre={genre} />
        </div>
        <SearchBar />
        <LanguageSelector locale={locale} />
      </div>
    </nav>
  );
}
