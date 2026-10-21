import type { Locale } from '@/lib/i18n/locale';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const TMDB_WATCH_REGION = 'ES';

const HOUR_IN_SECONDS = 60 * 60;
export const DEFAULT_REVALIDATE_SECONDS = HOUR_IN_SECONDS;
export const GENRES_REVALIDATE_SECONDS = 24 * HOUR_IN_SECONDS;
export const SEARCH_REVALIDATE_SECONDS = 60;

export const TMDB_LANGUAGE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
};
