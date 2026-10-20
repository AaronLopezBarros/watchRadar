'use client';

import Image from 'next/image';

import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';
import { POSTER_H, POSTER_W } from '@/src/components/PosterCard/constants';
import { GenreBadge } from '@/src/components/PosterCard/GenreBadge';
import { ProviderSection } from '@/src/components/PosterCard/ProviderSection';
import { RatingBadge } from '@/src/components/PosterCard/RatingBadge';
import { ShareButton } from '@/src/components/PosterCard/ShareButton';
import type { MediaItem, WatchProvider } from '@/src/lib/api/tmdb/types';
import { getPosterUrl } from '@/src/lib/utils';

type PosterDialogProps = {
  item: Pick<MediaItem, 'id' | 'title' | 'release_date' | 'poster_path' | 'vote_average' | 'overview' | 'genres'>;
  providers: WatchProvider[];
  isLoadingProviders: boolean;
  onClose: () => void;
};

export function PosterDialog({ item, providers, isLoadingProviders, onClose }: PosterDialogProps) {
  const year = item.release_date?.slice(0, 4);

  return (
    <BottomSheet label={item.title} onClose={onClose} tone='light' desktop='modal'>
      <div className='max-h-[70vh] overflow-y-auto px-4 pb-8 sm:pt-4'>
        <div className='mb-4 flex gap-4'>
          <div className='relative shrink-0 overflow-hidden rounded-md' style={{ width: POSTER_W, height: POSTER_H }}>
            <Image
              src={getPosterUrl(item.poster_path)}
              alt={item.title}
              fill
              sizes={`${POSTER_W}px`}
              className='object-cover'
            />
          </div>
          <div className='flex flex-col justify-center'>
            <h2 className='text-base font-semibold text-zinc-900'>{item.title}</h2>
            {year && <p className='mt-1 text-sm text-zinc-500'>{year}</p>}
            {item.genres.length > 0 && (
              <ul className='mt-1.5 flex flex-wrap gap-1'>
                {item.genres.map(genre => (
                  <li key={genre.id}>
                    <GenreBadge name={genre.name} />
                  </li>
                ))}
              </ul>
            )}
            <div className='mt-1.5'>
              <RatingBadge rating={item.vote_average} />
            </div>
            <div className='mt-3'>
              <ShareButton movieId={item.id} title={item.title} />
            </div>
          </div>
        </div>
        <p className='mb-4 text-sm leading-relaxed text-zinc-600'>{item.overview}</p>
        <ProviderSection providers={providers} isLoading={isLoadingProviders} />
      </div>
    </BottomSheet>
  );
}
