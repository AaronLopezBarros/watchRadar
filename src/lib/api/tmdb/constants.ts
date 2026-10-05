import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const MOVIE_CATEGORIES: MovieCategory[] = ['popular', 'top_rated', 'upcoming', 'now_playing'];

export const MOVIE_GENRES: MovieGenre[] = [
  'action',
  'adventure',
  'animation',
  'comedy',
  'crime',
  'drama',
  'fantasy',
  'horror',
  'romance',
  'science_fiction',
  'thriller',
];

export const TMDB_GENRE_ID: Record<MovieGenre, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  drama: 18,
  fantasy: 14,
  horror: 27,
  romance: 10749,
  science_fiction: 878,
  thriller: 53,
};

// Cinema-based lists barely overlap with what's already on streaming, and TMDB counts regional re-releases
// as theatrical, so combining them returns odd results (old blockbusters under "now playing").
export const STREAMING_CATEGORIES: MovieCategory[] = ['popular', 'top_rated'];

export const TMDB_WATCH_REGION = 'ES';

export const TMDB_LANGUAGE: Record<Locale, string> = {
  en: 'en-US',
  es: 'es-ES',
};
