import { cookies } from 'next/headers';

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, type Locale } from '@/lib/i18n/locale';

export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
};
