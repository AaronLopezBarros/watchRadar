'use client';

import Image from 'next/image';

import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';
import { POSTER_H, POSTER_W } from '@/src/components/MovieCard/constants';
import { ProviderSection } from '@/src/components/MovieCard/ProviderSection';
import { RatingBadge } from '@/src/components/MovieCard/RatingBadge';
import { ShareButton } from '@/src/components/MovieCard/ShareButton';
import type { Movie, WatchProvider } from '@/src/lib/api/tmdb/types';
import { getPosterUrl } from '@/src/lib/utils';

type MovieDialogProps = {
  movie: Pick<Movie, 'id' | 'title' | 'release_date' | 'poster_path' | 'vote_average' | 'overview'>;
  providers: WatchProvider[];
  isLoadingProviders: boolean;
  onClose: () => void;
};

export function MovieDialog({ movie, providers, isLoadingProviders, onClose }: MovieDialogProps) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <BottomSheet label={movie.title} onClose={onClose} tone='light' desktop='modal'>
      <div className='max-h-[70vh] overflow-y-auto px-4 pb-8 sm:pt-4'>
        <div className='mb-4 flex gap-4'>
          <div className='relative shrink-0 overflow-hidden rounded-md' style={{ width: POSTER_W, height: POSTER_H }}>
            <Image
              src={getPosterUrl(movie.poster_path)}
              alt={movie.title}
              fill
              sizes={`${POSTER_W}px`}
              className='object-cover'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <h2 className='text-base font-semibold text-zinc-900'>{movie.title}</h2>
            {year && <p className='mt-1 text-sm text-zinc-500'>{year}</p>}
            <div className='mt-1.5'>
              <RatingBadge rating={movie.vote_average} />
            </div>
            <div className='mt-3'>
              <ShareButton movieId={movie.id} title={movie.title} />
            </div>
          </div>
        </div>
        <p className='mb-4 text-sm leading-relaxed text-zinc-600'>{movie.overview}</p>
        <ProviderSection providers={providers} isLoading={isLoadingProviders} />
      </div>
    </BottomSheet>
  );
}
