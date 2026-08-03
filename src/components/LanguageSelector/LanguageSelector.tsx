'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';

import { setLocale } from '@/lib/i18n/actions';
import { getDictionary } from '@/lib/i18n/dictionary';
import { SUPPORTED_LOCALES, type Locale } from '@/lib/i18n/locale';
import { cn } from '@/lib/utils';

const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', es: 'ES' };
const LOCALE_NAME: Record<Locale, string> = { en: 'English', es: 'Español' };

type LanguageSelectorProps = {
  locale: Locale;
};

export function LanguageSelector({ locale }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
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

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div className='relative shrink-0'>
      <button
        ref={triggerRef}
        type='button'
        onClick={() => setIsOpen(open => !open)}
        aria-label={`${dict.language.changeAriaLabel}: ${LOCALE_LABEL[locale]}`}
        aria-expanded={isOpen}
        disabled={isPending}
        className='flex h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/5 px-2.5 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-default'
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
              aria-label={`Switch to ${LOCALE_NAME[value]}: ${LOCALE_LABEL[value]}`}
              className={cn(
                'flex h-11 min-w-11 cursor-pointer items-center justify-center rounded-full px-3 whitespace-nowrap transition-colors',
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
