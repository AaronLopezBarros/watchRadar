'use client';

import { useRef, useState } from 'react';

import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import type { Movie } from '@/src/lib/api/tmdb/types';
import { cn } from '@/src/lib/utils';

const POSTER_W = 50;
const POSTER_H = 80;
const POSTER_W_HOVER = 200;
const POSTER_H_HOVER = 320;
const PANEL_W = 180;

const EXPANDED_WIDTH = POSTER_W_HOVER + PANEL_W;
const EXPANDED_HEIGHT = POSTER_H_HOVER;

type MovieCardProps = {
  movie: Movie;
};

export function MovieCard({ movie }: MovieCardProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);

  const year = movie.release_date?.slice(0, 4);

  const calculateFlipPosition = (cardRect?: DOMRect) => {
    setFlipX(!!cardRect && cardRect.left + EXPANDED_WIDTH > window.innerWidth);
    setFlipY(!!cardRect && cardRect.top + EXPANDED_HEIGHT > window.innerHeight);
  };

  const handleMouseEnter = () => {
    const cardRect = articleRef.current?.getBoundingClientRect();

    calculateFlipPosition(cardRect);

    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const posterW = isHovered ? POSTER_W_HOVER : POSTER_W;
  const posterH = isHovered ? POSTER_H_HOVER : POSTER_H;

  return (
    <article
      ref={articleRef}
      className='relative shrink-0 cursor-pointer'
      style={{ width: POSTER_W, height: POSTER_H }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={cn(
          'absolute flex rounded-md transition-[width,height] duration-300 ease-out',
          flipX ? 'right-0 flex-row-reverse' : 'left-0',
          flipY ? 'top-auto bottom-0' : 'top-0',
          isHovered ? 'z-50' : 'z-0',
        )}
      >
        <ImageCard movie={movie} isHovered flipX posterH={posterH} posterW={posterW} />

        <div
          className={cn(
            'overflow-hidden bg-white transition-[width,opacity,padding] duration-300 ease-out',
            isHovered ? (flipX ? 'rounded-l-md' : 'rounded-r-md') : 'rounded-none',
            isHovered ? 'px-3 py-2 opacity-100' : 'w-0 p-0 opacity-0',
          )}
          style={{ height: posterH, width: posterW }}
        >
          <div className='scrollbar-hidden h-full overflow-y-auto'>
            <h3 className='text-sm font-semibold text-zinc-900'>{movie.title}</h3>
            {year && <p className='mt-1 text-xs text-zinc-500'>{year}</p>}
            <p className='mt-2 text-xs leading-relaxed text-zinc-600'>{movie.overview}</p>
            <p className='mt-2 text-xs text-zinc-500'>★ {movie.vote_average.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
