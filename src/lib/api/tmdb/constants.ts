import type { MovieCategory } from '@/lib/api/tmdb/types';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const MOVIE_CATEGORIES: { value: MovieCategory; label: string }[] = [
  { value: 'popular', label: 'Popular' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'now_playing', label: 'Now Playing' },
];
