import type { Movie } from '@/src/lib/api/tmdb/types';
import { cn } from '@/src/lib/utils';

type MovieCardInfoProps = {
  movie: Movie;
  isHovered: boolean;
  flipX: boolean;
  posterH: number;
  posterW: number;
};

export function MovieCardInfo({ movie, isHovered, flipX, posterH, posterW }: MovieCardInfoProps) {
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
      <div className='scrollbar-hidden h-full overflow-y-auto'>
        <h3 className='text-sm font-semibold text-zinc-900'>{movie.title}</h3>
        {year && <p className='mt-1 text-xs text-zinc-500'>{year}</p>}
        <p className='mt-2 text-xs leading-relaxed text-zinc-600'>{movie.overview}</p>
        <p className='mt-2 text-xs text-zinc-500'>★ {movie.vote_average.toFixed(1)}</p>
      </div>
    </div>
  );
}
