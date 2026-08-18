'use client';

import { useEffect, useRef, useState } from 'react';

import { POSTER_H, POSTER_W } from '@/src/components/MovieCard/constants';
import { useWatchProviders } from '@/src/components/MovieCard/hooks/useWatchProviders';
import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { MovieDialog } from '@/src/components/MovieCard/MovieDialog';
import type { Movie } from '@/src/lib/api/tmdb/types';

type MovieCardProps = {
  movie: Movie;
  priority?: boolean;
};

export function MovieCard({ movie, priority = false }: MovieCardProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { providers, isLoading: isLoadingProviders, fetchProviders } = useWatchProviders(movie.id);

  const handleOpen = () => {
    fetchProviders();
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
          onClose={() => setIsOpen(false)}
        />
      )}
    </article>
  );
}
