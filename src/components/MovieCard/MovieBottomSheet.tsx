'use client';

import Image from 'next/image';

import { ProviderSection } from '@/src/components/MovieCard/ProviderSection';
import { RatingBadge } from '@/src/components/MovieCard/RatingBadge';
import type { Movie, WatchProvider } from '@/src/lib/api/tmdb/types';
import { getPosterUrl } from '@/src/lib/utils';

const POSTER_W = 80;
const POSTER_H = 120;

type MovieBottomSheetProps = {
  movie: Movie;
  providers: WatchProvider[];
  isLoadingProviders: boolean;
  onClose: () => void;
};

export function MovieBottomSheet({ movie, providers, isLoadingProviders, onClose }: MovieBottomSheetProps) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <div className='fixed inset-0 z-50 flex items-end'>
      <div
        data-testid='bottom-sheet-backdrop'
        className='absolute inset-0 animate-[fade-in_300ms_ease-out] bg-black/50'
        onClick={event => {
          event.stopPropagation();
          onClose();
        }}
      />
      <div
        className='relative w-full animate-[slide-up_300ms_ease-out] rounded-t-2xl bg-white'
        onClick={event => event.stopPropagation()}
      >
        <div className='flex justify-center pt-3 pb-4'>
          <div className='h-1 w-10 rounded-full bg-zinc-300' />
        </div>
        <div className='max-h-[70vh] overflow-y-auto px-4 pb-8'>
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
            </div>
          </div>
          <p className='mb-4 text-sm leading-relaxed text-zinc-600'>{movie.overview}</p>
          <ProviderSection providers={providers} isLoading={isLoadingProviders} />
        </div>
      </div>
    </div>
  );
}
