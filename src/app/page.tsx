/* eslint-disable @typescript-eslint/no-explicit-any */
import { getPopularMovies } from '@/lib/api/tmdb/movies';
export default async function Home() {
  const movies: any = await getPopularMovies();

  return (
    <div>
      <h1>Hello World</h1>
      <ul>
        {movies.results.map((movie: any) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
}
