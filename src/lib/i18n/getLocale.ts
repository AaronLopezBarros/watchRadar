import { cookies, headers } from 'next/headers';
import { userAgent } from 'next/server';

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE_NAME, matchAcceptLanguage, type Locale } from '@/lib/i18n/locale';

// An explicit choice (the cookie set by the language selector) wins; first-time visitors get their browser language.
export const getLocale = async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (isLocale(raw)) return raw;

  const headerStore = await headers();
  return matchAcceptLanguage(headerStore.get('accept-language')) ?? DEFAULT_LOCALE;
};

// Link-preview bots (WhatsApp, Telegram…) carry neither the sharer's cookie nor their Accept-Language, so shared
// links name the sharer's locale and previews honor it. People opening the link still get their own language.
export const getMetadataLocale = async (sharedLocale?: Locale): Promise<Locale> => {
  if (sharedLocale && userAgent({ headers: await headers() }).isBot) return sharedLocale;
  return getLocale();
};
