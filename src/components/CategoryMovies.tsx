import { fetchMovies } from '@/lib/api/tmdb/actions';
import type { MovieCategory } from '@/lib/api/tmdb/types';
import { InfiniteMovieGrid } from '@/src/components/InfiniteMovieGrid';

const INITIAL_PAGE = 1;

type CategoryMoviesProps = {
  category: MovieCategory;
};

export async function CategoryMovies({ category }: CategoryMoviesProps) {
  const movies = await fetchMovies(category, INITIAL_PAGE);

  return <InfiniteMovieGrid initialMovies={movies} initialPage={INITIAL_PAGE} category={category} />;
}
