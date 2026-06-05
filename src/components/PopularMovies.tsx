import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { getPopularMoviesMultiplePages } from '@/src/lib/api/tmdb/movies';
import { Movie } from '@/src/lib/api/tmdb/types';

export async function PopularMovies() {
  const movies = await getPopularMoviesMultiplePages(10);

  return (
    <div className='flex flex-wrap items-center justify-center gap-5 overflow-visible px-5 py-10'>
      {movies.map((movie: Movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
