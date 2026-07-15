import Image from 'next/image';

import { Movie } from '@/src/lib/api/tmdb/types';
import { cn, getPosterUrl } from '@/src/lib/utils';

const POSTER_W = 80;
const POSTER_W_HOVER = 200;
const POSTER_H_HOVER = 320;

type ImageCardProps = {
  movie: Movie;
  isHovered: boolean;
  flipX: boolean;
  flipY: boolean;
  priority?: boolean;
};

export function ImageCard({ movie, isHovered, flipX, flipY, priority = false }: ImageCardProps) {
  // Scales the whole poster render down to the collapsed size instead of animating
  // width/height, so the transition never triggers layout (no CLS).
  const scale = isHovered ? 1 : POSTER_W / POSTER_W_HOVER;

  return (
    <div
      data-testid='image-card-container'
      className={cn(
        'relative shrink-0 overflow-hidden transition-transform duration-300 ease-out',
        isHovered ? (flipX ? 'rounded-r-md' : 'rounded-l-md') : 'rounded-md',
      )}
      style={{
        width: POSTER_W_HOVER,
        height: POSTER_H_HOVER,
        transform: `scale(${scale})`,
        transformOrigin: `${flipX ? 'right' : 'left'} ${flipY ? 'bottom' : 'top'}`,
      }}
    >
      <Image
        src={getPosterUrl(movie.poster_path)}
        alt={movie.title}
        fill
        sizes={`${POSTER_W_HOVER}px`}
        className='object-cover'
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  );
}
