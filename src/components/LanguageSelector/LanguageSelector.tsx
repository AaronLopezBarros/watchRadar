'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { setLocale } from '@/lib/i18n/actions';
import { getDictionary } from '@/lib/i18n/dictionary';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/locale';
import { cn } from '@/src/lib/utils';

const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', es: 'ES' };
const LOCALE_NAME: Record<Locale, string> = { en: 'English', es: 'Español' };

type LanguageSelectorProps = {
  locale: Locale;
};

export function LanguageSelector({ locale }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const dict = getDictionary(locale);

  const handleSelect = (next: Locale) => {
    setIsOpen(false);
    if (next === locale) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  };

  return (
    <div className='relative shrink-0'>
      <button
        type='button'
        onClick={() => setIsOpen(open => !open)}
        aria-label={dict.language.changeAriaLabel}
        aria-expanded={isOpen}
        disabled={isPending}
        className='flex shrink-0 items-center justify-center rounded-full bg-white/5 px-2.5 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white'
      >
        {LOCALE_LABEL[locale]}
      </button>
      {isOpen && (
        <div
          role='group'
          aria-label={dict.language.groupAriaLabel}
          className='absolute top-full right-0 z-20 mt-1 flex items-center gap-0.5 rounded-full bg-slate-950 p-0.5 text-sm shadow-lg'
        >
          {SUPPORTED_LOCALES.map(value => (
            <button
              key={value}
              type='button'
              onClick={() => handleSelect(value)}
              aria-pressed={value === locale}
              aria-label={`Switch to ${LOCALE_NAME[value]}`}
              className={cn(
                'rounded-full px-3 py-1.5 whitespace-nowrap transition-colors',
                value === locale ? 'bg-white/20 font-medium text-white' : 'text-white/60 hover:bg-white/10',
              )}
            >
              {LOCALE_LABEL[value]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
