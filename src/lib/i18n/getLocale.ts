import { cookies, headers } from 'next/headers';

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, matchAcceptLanguage, type Locale } from '@/lib/i18n/locale';

// An explicit choice (the cookie set by the language selector) wins; first-time visitors get their browser language.
export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(raw)) return raw;

  const headerStore = await headers();
  return matchAcceptLanguage(headerStore.get('accept-language')) ?? DEFAULT_LOCALE;
};
