'use client';

import { useRef, useState, type CSSProperties } from 'react';

import { POSTER_H, POSTER_W } from '@/components/PosterCard/constants';
import { useWatchProviders } from '@/components/PosterCard/hooks/useWatchProviders';
import { ImageCard } from '@/components/PosterCard/ImageCard';
import { PosterDialog } from '@/components/PosterCard/PosterDialog';
import type { MediaItem } from '@/lib/api/tmdb/types';
import { withMediaParam } from '@/lib/utils';

type PosterCardProps = {
  item: MediaItem;
  priority?: boolean;
  enterDelayMs?: number;
};

export function PosterCard({ item, priority = false, enterDelayMs }: PosterCardProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { providers, isLoading: isLoadingProviders, fetchProviders } = useWatchProviders(item.mediaType, item.id);

  // Native history keeps the open item in the URL without a server round trip that would refetch the grid.
  const handleOpen = () => {
    fetchProviders();
    setIsOpen(true);
    window.history.replaceState(null, '', withMediaParam(window.location.search, item));
  };

  const handleClose = () => {
    setIsOpen(false);
    window.history.replaceState(null, '', withMediaParam(window.location.search));
    triggerRef.current?.focus();
  };

  return (
    <article
      // The delay only applies on phones, where the staggered cards fill the first screen; on wider screens the first
      // rows would enter one by one while the rest are already in. `backwards` keeps a card hidden during its delay.
      className='relative w-full shrink-0 animate-[card-in_300ms_ease-out_backwards] motion-reduce:animate-none max-sm:[animation-delay:var(--enter-delay)] sm:w-27.5'
      style={
        {
          aspectRatio: `${POSTER_W} / ${POSTER_H}`,
          '--enter-delay': enterDelayMs === undefined ? undefined : `${enterDelayMs}ms`,
        } as CSSProperties
      }
    >
      <button
        ref={triggerRef}
        type='button'
        onClick={handleOpen}
        aria-label={item.title}
        aria-haspopup='dialog'
        aria-expanded={isOpen}
        className='block h-full w-full cursor-pointer overflow-hidden rounded-md shadow-2xl transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
      >
        <ImageCard item={item} priority={priority} />
      </button>
      {isOpen && (
        <PosterDialog item={item} providers={providers} isLoadingProviders={isLoadingProviders} onClose={handleClose} />
      )}
    </article>
  );
}
