import Image from 'next/image';

import type { Movie } from '@/src/lib/api/tmdb/types';
import { getPosterUrl } from '@/src/lib/utils/getPosterUrl';

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <article className='w-[40px] shrink-0 cursor-pointer rounded-md shadow-xl transition-transform duration-300 ease-in-out hover:scale-500'>
      <div className='overflow-hidden rounded-md'>
        <Image src={getPosterUrl(movie.poster_path)} alt={movie.title} width={100} height={150} />
      </div>
    </article>
  );
}
