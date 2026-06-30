import { fetchPopularMovies } from '@/lib/api/tmdb/actions';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid';

export async function PopularMovies() {
  const movies = await fetchPopularMovies(1);

  return <InfiniteMovieGrid initialMovies={movies} initialPage={1} />;
}
