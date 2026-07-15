export type Locale = 'en' | 'es';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];
export const LOCALE_COOKIE_NAME = 'locale';

export const isLocale = (value: string | undefined): value is Locale =>
  SUPPORTED_LOCALES.some(supported => supported === value);
