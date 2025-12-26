const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const getPosterUrl = (path: string | null, size: 'w342' | 'w500' | 'original' = 'w500') =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '/poster-placeholder.png';
