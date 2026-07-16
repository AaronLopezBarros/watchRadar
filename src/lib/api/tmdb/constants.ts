import type { MovieCategory } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const MOVIE_CATEGORIES: MovieCategory[] = ['popular', 'top_rated', 'upcoming', 'now_playing'];

export const TMDB_LANGUAGE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
};
