import { tmdbClient } from '@/lib/api/tmdb/client';

export async function getPopularMovies() {
  return tmdbClient('/movie/popular');
}
