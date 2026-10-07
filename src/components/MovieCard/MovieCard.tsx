'use client';

import { useRef, useState } from 'react';

import { POSTER_H, POSTER_W } from '@/src/components/MovieCard/constants';
import { useWatchProviders } from '@/src/components/MovieCard/hooks/useWatchProviders';
import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { MovieDialog } from '@/src/components/MovieCard/MovieDialog';
import type { Movie } from '@/src/lib/api/tmdb/types';
import { withMovieParam } from '@/src/lib/utils';

type MovieCardProps = {
  movie: Movie;
  priority?: boolean;
};

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { providers, isLoading: isLoadingProviders, fetchProviders } = useWatchProviders(movie.id);

  // Native history keeps the open movie in the URL without a server round trip that would refetch the grid.
  const handleOpen = () => {
    fetchProviders();
    setIsOpen(true);
    window.history.replaceState(null, '', withMovieParam(window.location.search, movie.id));
  };

  const handleClose = () => {
    setIsOpen(false);
    window.history.replaceState(null, '', withMovieParam(window.location.search));
    triggerRef.current?.focus();
  };

  return (
    <article
      className='relative w-full shrink-0 animate-[card-in_300ms_ease-out] sm:w-27.5'
      style={{ aspectRatio: `${POSTER_W} / ${POSTER_H}` }}
    >
      <button
        ref={triggerRef}
        type='button'
        onClick={handleOpen}
        aria-label={movie.title}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        className='block h-full w-full cursor-pointer overflow-hidden rounded-md shadow-2xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
      >
        <ImageCard movie={movie} priority={priority} />
      </button>
      {isOpen && (
        <MovieDialog
          movie={movie}
          providers={providers}
          isLoadingProviders={isLoadingProviders}
          onClose={handleClose}
        />
      )}
    </article>
  );
}
