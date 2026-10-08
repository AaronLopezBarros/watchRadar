export type Locale = 'en' | 'es';

export const DEFAULT_LOCALE: Locale = 'en';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'es'];
export const LOCALE_COOKIE_NAME = 'locale';

export const isLocale = (value: string | undefined): value is Locale =>
  SUPPORTED_LOCALES.some(supported => supported === value);

type LanguagePreference = {
  language: string;
  weight: number;
};

const parseLanguagePreference = (entry: string): LanguagePreference => {
  const [tag, ...params] = entry.trim().split(';');
  const weightParam = params.find(param => param.trim().startsWith('q='));
  const weight = weightParam ? Number(weightParam.trim().slice(2)) : 1;

  // Only the base language matters: `es-ES` and `es-MX` both get the `es` dictionary.
  return { language: tag.split('-')[0].toLowerCase(), weight: Number.isNaN(weight) ? 0 : weight };
};

// Picks the supported locale the browser ranks highest in its Accept-Language header (`es-ES,es;q=0.9,en;q=0.8`).
export const matchAcceptLanguage = (header: string | null | undefined): Locale | undefined =>
  header
    ?.split(',')
    .map(parseLanguagePreference)
    .filter(({ weight }) => weight > 0)
    .sort((first, second) => second.weight - first.weight)
    .map(({ language }) => language)
    .find(isLocale);
