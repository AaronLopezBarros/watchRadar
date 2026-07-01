'use client';

import { useRef, useState } from 'react';

import { useIsTouchDevice } from '@/src/components/MovieCard/hooks/useIsTouchDevice';
import { useMovieCardHover } from '@/src/components/MovieCard/hooks/useMovieCardHover';
import { useWatchProviders } from '@/src/components/MovieCard/hooks/useWatchProviders';
import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { MovieBottomSheet } from '@/src/components/MovieCard/MovieBottomSheet';
import { MovieCardInfo } from '@/src/components/MovieCard/MovieCardInfo';
import type { Movie } from '@/src/lib/api/tmdb/types';
import { cn } from '@/src/lib/utils';

const POSTER_W = 80;
const POSTER_H = 128;
const POSTER_W_HOVER = 200;
const POSTER_H_HOVER = 320;
const PANEL_W = 180;

type MovieCardProps = {
  movie: Movie;
  priority?: boolean;
};

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const articleRef = useRef<HTMLElement>(null);
  const isTouchDevice = useIsTouchDevice();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { isHovered, flipX, flipY, handleMouseEnter, handleMouseLeave } = useMovieCardHover(articleRef, {
    delay: 175,
    expandedWidth: POSTER_W_HOVER + PANEL_W,
    expandedHeight: POSTER_H_HOVER,
  });
  const { providers, isLoading: isLoadingProviders, fetchProviders } = useWatchProviders(movie.id);

  const posterW = isHovered ? POSTER_W_HOVER : POSTER_W;
  const posterH = isHovered ? POSTER_H_HOVER : POSTER_H;

  const onMouseEnter = () => {
    if (isTouchDevice) return;
    handleMouseEnter();
    fetchProviders();
  };

  const onCardClick = () => {
    if (!isTouchDevice) return;
    fetchProviders();
    setIsSheetOpen(true);
  };

  return (
    <article
      ref={articleRef}
      className='relative shrink-0 cursor-pointer'
      style={{ width: POSTER_W, height: POSTER_H }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick}
    >
      <div
        data-testid='movie-card-container'
        className={cn(
          'absolute flex rounded-md transition-[width,height] duration-300 ease-out',
          flipX ? 'right-0 flex-row-reverse' : 'left-0',
          flipY ? 'top-auto bottom-0' : 'top-0',
          isHovered ? 'z-50' : 'z-0',
        )}
      >
        <ImageCard
          movie={movie}
          isHovered={isHovered}
          flipX={flipX}
          posterH={posterH}
          posterW={posterW}
          priority={priority}
        />
        <MovieCardInfo
          movie={movie}
          isHovered={isHovered}
          flipX={flipX}
          posterH={posterH}
          posterW={posterW}
          providers={providers}
          isLoadingProviders={isLoadingProviders}
        />
      </div>
      {isSheetOpen && (
        <MovieBottomSheet
          movie={movie}
          providers={providers}
          isLoadingProviders={isLoadingProviders}
          onClose={() => setIsSheetOpen(false)}
        />
      )}
    </article>
  );
}
