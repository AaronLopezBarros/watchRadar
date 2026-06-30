import { TMDB_IMAGE_BASE } from '@/lib/api/tmdb/constants';

export const getLogoUrl = (path: string) => `${TMDB_IMAGE_BASE}/w45${path}`;
