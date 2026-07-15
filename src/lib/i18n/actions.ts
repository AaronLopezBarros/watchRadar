'use server';

import { cookies } from 'next/headers';

import { isLocale, LOCALE_COOKIE_NAME } from '@/lib/i18n/locale';

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export const setLocale = async (locale: string): Promise<void> => {
  if (!isLocale(locale)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    path: '/',
    maxAge: ONE_YEAR_IN_SECONDS,
    sameSite: 'lax',
    httpOnly: true,
  });
};
