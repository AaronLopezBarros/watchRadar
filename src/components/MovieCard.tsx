'use client';

import Image from 'next/image';
import { useState } from 'react';

import type { Movie } from '@/src/lib/api/tmdb/types';
import { cn, getPosterUrl } from '@/src/lib/utils';

const POSTER_W = 50;
const POSTER_H = 80;

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const year = movie.release_date?.slice(0, 4);

  return (
    <article
      className='relative shrink-0 cursor-pointer'
      style={{ width: POSTER_W, height: POSTER_H }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'absolute top-0 left-0 flex origin-top-left rounded-md',
          'transition-transform duration-300 ease-out',
          isHovered ? 'z-50 scale-[3] shadow-xl' : 'z-0 scale-100',
        )}
      >
        <div
          className={cn('relative shrink-0 overflow-hidden shadow-xl', isHovered ? 'rounded-l-md' : 'rounded-md')}
          style={{ width: POSTER_W, height: POSTER_H }}
        >
          <Image src={getPosterUrl(movie.poster_path)} alt={movie.title} fill />
        </div>

        <div
          className={cn(
            'scrollbar-hidden h-[100px] min-w-[140px] overflow-y-auto rounded-r-md bg-white p-3',
            'transition-[width,opacity] duration-300 ease-out',
            isHovered ? 'w-[140px] opacity-100' : 'w-0 p-0 opacity-0',
          )}
          style={{ width: POSTER_W, height: POSTER_H }}
        >
          <h3 className='text-[8px] font-semibold'>{movie.title}</h3>
          {year && <p className='mt-1 text-[6px] text-zinc-500'>{year}</p>}
          <p className='mt-1 text-[6px] text-zinc-600'>{movie.overview}</p>
        </div>
      </div>
    </article>
  );
}
