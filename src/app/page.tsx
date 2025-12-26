import Image from 'next/image';

import { getPopularMoviesMultiplePages } from '@/src/lib/api/tmdb/movies';
import { Movie } from '@/src/lib/api/tmdb/types';
import { getPosterUrl } from '@/src/lib/utils/getPosterUrl';

export default async function Home() {
  const movies = await getPopularMoviesMultiplePages(3);

  return (
    <div className='wrap flex items-center justify-center gap-3'>
      {movies.map((movie: Movie) => (
        <Image key={movie.id} src={getPosterUrl(movie.poster_path)} alt={movie.title} width={100} height={100} />
      ))}
    </div>
  );
}
