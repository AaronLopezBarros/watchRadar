import Image from 'next/image';

import type { Movie, WatchProvider } from '@/src/lib/api/tmdb/types';
import { cn, getLogoUrl } from '@/src/lib/utils';

const MAX_VISIBLE_LOGOS = 4;

type MovieCardInfoProps = {
  movie: Movie;
  isHovered: boolean;
  flipX: boolean;
  posterH: number;
  posterW: number;
  providers: WatchProvider[];
  isLoadingProviders: boolean;
};

export function MovieCardInfo({
  movie,
  isHovered,
  flipX,
  posterH,
  posterW,
  providers,
  isLoadingProviders,
}: MovieCardInfoProps) {
  const year = movie.release_date?.slice(0, 4);
  const visibleProviders = providers.slice(0, MAX_VISIBLE_LOGOS);
  const extraCount = providers.length - visibleProviders.length;

  return (
    <div
      data-testid='movie-card-info-container'
      className={cn(
        'overflow-hidden bg-white transition-[width,opacity,padding] duration-300 ease-out',
        isHovered ? (flipX ? 'rounded-l-md' : 'rounded-r-md') : 'rounded-none',
        isHovered ? 'px-3 py-2 opacity-100' : 'w-0 p-0 opacity-0',
      )}
      style={{ height: posterH, width: posterW }}
    >
      <div className='flex h-full flex-col'>
        <div className='scrollbar-hidden min-h-0 flex-1 overflow-y-auto'>
          <h3 className='text-sm font-semibold text-zinc-900'>{movie.title}</h3>
          {year && <p className='mt-1 text-xs text-zinc-500'>{year}</p>}
          <p className='mt-2 text-xs leading-relaxed text-zinc-600'>{movie.overview}</p>
          <p className='mt-2 text-xs text-zinc-500'>★ {movie.vote_average.toFixed(1)}</p>
        </div>

        <div className='shrink-0 border-t border-zinc-100 pt-2'>
          <p className='mb-1.5 text-[10px] font-medium tracking-wide text-zinc-400 uppercase'>Dónde ver</p>
          {isLoadingProviders ? (
            <div className='flex gap-1.5'>
              {[0, 1, 2].map(index => (
                <div key={index} className='h-8 w-8 animate-pulse rounded-sm bg-zinc-200' />
              ))}
            </div>
          ) : visibleProviders.length > 0 ? (
            <div className='flex items-center gap-1.5'>
              {visibleProviders.map(provider => (
                <Image
                  key={provider.provider_id}
                  src={getLogoUrl(provider.logo_path)}
                  alt={provider.provider_name}
                  title={provider.provider_name}
                  width={32}
                  height={32}
                  className='rounded-sm'
                />
              ))}
              {extraCount > 0 && <span className='text-[10px] font-medium text-zinc-400'>+{extraCount}</span>}
            </div>
          ) : (
            <p className='text-[10px] text-zinc-400'>No disponible en streaming</p>
          )}
        </div>
      </div>
    </div>
  );
}
