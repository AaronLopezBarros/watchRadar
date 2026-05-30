'use client';
import Image from 'next/image';

import type { Movie } from '@/src/lib/api/tmdb/types';

import { cn, getPosterUrl } from '@/src/lib/utils';
import { useState } from 'react';

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const [isMovieSelected, setIsMovieSelected] = useState(false);
  console.log(movie);
  return (
    <article
      className={cn(
        'shrink-0 cursor-pointer rounded-md shadow-xl transition-transform duration-300 ease-in-out hover:scale-500',
        isMovieSelected ? 'w-[280px]' : 'w-[100px]',
      )}
    >
      <div
        className='shrink-0 overflow-hidden rounded-l-md'
        onMouseEnter={() => setIsMovieSelected(true)}
        onMouseLeave={() => setIsMovieSelected(false)}
      >
        <Image src={getPosterUrl(movie.poster_path)} alt={movie.title} width={100} height={150} />
      </div>
      {isMovieSelected && <div className='min-w-0 flex-1 rounded-r-md bg-white p-3'>Holaaa</div>}
    </article>
  );
}
