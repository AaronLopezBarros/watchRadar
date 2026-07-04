import { ProviderSection } from '@/src/components/MovieCard/ProviderSection';
import { RatingBadge } from '@/src/components/MovieCard/RatingBadge';
import type { Movie, WatchProvider } from '@/src/lib/api/tmdb/types';
import { cn } from '@/src/lib/utils';

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
          <div className='mt-2'>
            <RatingBadge rating={movie.vote_average} />
          </div>
        </div>
        <ProviderSection providers={providers} isLoading={isLoadingProviders} maxVisible={MAX_VISIBLE_LOGOS} />
      </div>
    </div>
  );
}
