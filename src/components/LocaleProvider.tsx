'use client';

import { createContext, useContext, type ReactNode } from 'react';

import { getDictionary, type Dictionary } from '@/lib/i18n/dictionary';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/locale';

const LocaleContext = createContext<Dictionary>(getDictionary(DEFAULT_LOCALE));

export const useTranslations = () => useContext(LocaleContext);

type LocaleProviderProps = {
  locale: Locale;
  children: ReactNode;
};

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={getDictionary(locale)}>{children}</LocaleContext.Provider>;
}
