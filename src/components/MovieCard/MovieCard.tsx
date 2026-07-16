'use client';

import { useRef, useState } from 'react';

import { PANEL_W, POSTER_H, POSTER_H_HOVER, POSTER_W, POSTER_W_HOVER } from '@/src/components/MovieCard/constants';
import { useIsTouchDevice } from '@/src/components/MovieCard/hooks/useIsTouchDevice';
import { useMovieCardHover } from '@/src/components/MovieCard/hooks/useMovieCardHover';
import { useWatchProviders } from '@/src/components/MovieCard/hooks/useWatchProviders';
import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { MovieBottomSheet } from '@/src/components/MovieCard/MovieBottomSheet';
import { MovieCardInfo } from '@/src/components/MovieCard/MovieCardInfo';
import type { Movie } from '@/src/lib/api/tmdb/types';
import { cn } from '@/src/lib/utils';

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
      className='relative shrink-0 cursor-pointer animate-[card-in_300ms_ease-out]'
      style={{ width: POSTER_W, height: POSTER_H }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onCardClick}
    >
      <div
        data-testid='movie-card-container'
        className={cn(
          'absolute flex',
          flipX ? 'right-0 flex-row-reverse' : 'left-0',
          flipY ? 'top-auto bottom-0' : 'top-0',
          isHovered ? 'z-50 aurora-glow-active' : 'z-0',
        )}
      >
        <ImageCard movie={movie} isHovered={isHovered} flipX={flipX} flipY={flipY} priority={priority} />
        <MovieCardInfo
          movie={movie}
          isHovered={isHovered}
          flipX={flipX}
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
