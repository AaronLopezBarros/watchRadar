'use client';

import { useState } from 'react';

import { MovieDialog } from '@/src/components/MovieCard/MovieDialog';
import type { MovieDetails, WatchProvider } from '@/src/lib/api/tmdb/types';
import { withMovieParam } from '@/src/lib/utils';

type SharedMovieDialogProps = {
  movie: MovieDetails;
  providers: WatchProvider[];
};

export function SharedMovieDialog({ movie, providers }: SharedMovieDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    window.history.replaceState(null, '', withMovieParam(window.location.search));
  };

  if (!isOpen) return null;

  return <MovieDialog movie={movie} providers={providers} isLoadingProviders={false} onClose={handleClose} />;
}
