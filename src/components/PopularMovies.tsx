import { fetchPopularMovies } from '@/lib/api/tmdb/actions';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid';

const INITIAL_PAGE = 1;

export async function PopularMovies() {
  const movies = await fetchPopularMovies(INITIAL_PAGE);

  return <InfiniteMovieGrid initialMovies={movies} />;
}
