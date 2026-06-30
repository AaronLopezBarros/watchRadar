import { TMDB_IMAGE_BASE } from '@/lib/api/tmdb/constants';

export const getPosterUrl = (path: string | null, size: 'w342' | 'w500' | 'original' = 'w500') =>
  path ? `${TMDB_IMAGE_BASE}/${size}${path}` : '/assets/images/poster-placeholder.webp';
