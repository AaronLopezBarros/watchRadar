'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { getDictionary, type Dictionary } from '@/lib/i18n/dictionary';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locale';

type LocaleContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  dict: getDictionary(DEFAULT_LOCALE),
});

export const useTranslations = () => useContext(LocaleContext).dict;
export const useLocale = () => useContext(LocaleContext).locale;

type LocaleProviderProps = {
  locale: Locale;
  children: ReactNode;
};

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={{ locale, dict: getDictionary(locale) }}>{children}</LocaleContext.Provider>;
}
