'use client';

import { useState } from 'react';

import { PosterDialog } from '@/src/components/PosterCard/PosterDialog';
import type { MediaItem, WatchProvider } from '@/src/lib/api/tmdb/types';
import { withMovieParam } from '@/src/lib/utils';

type SharedMediaDialogProps = {
  item: MediaItem;
  providers: WatchProvider[];
};

export function SharedMediaDialog({ item, providers }: SharedMediaDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    window.history.replaceState(null, '', withMovieParam(window.location.search));
  };

  if (!isOpen) return null;

  return <PosterDialog item={item} providers={providers} isLoadingProviders={false} onClose={handleClose} />;
}
