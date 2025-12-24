import { getPopularMoviesMultiplePages } from '@/src/lib/api/tmdb/movies';
import { Movie } from '@/src/lib/api/tmdb/types';

export default async function Home() {
  const movies = await getPopularMoviesMultiplePages(3);

  return (
    <div>
      <h1>Hello World</h1>
      <ul>
        {movies.map((movie: Movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}
