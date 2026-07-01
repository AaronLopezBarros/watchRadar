import Image from 'next/image';

import { Movie } from '@/src/lib/api/tmdb/types';
import { cn, getPosterUrl } from '@/src/lib/utils';

type ImageCardProps = {
  movie: Movie;
  isHovered: boolean;
  flipX: boolean;
  posterH: number;
  posterW: number;
  priority?: boolean;
};

export function ImageCard({ movie, isHovered, flipX, posterH, posterW, priority = false }: ImageCardProps) {
  return (
    <div
      data-testid='image-card-container'
      className={cn(
        'relative shrink-0 overflow-hidden transition-[width,height] duration-300 ease-out',
        isHovered ? (flipX ? 'rounded-r-md' : 'rounded-l-md') : 'rounded-md',
      )}
      style={{ width: posterW, height: posterH }}
    >
      <Image
        src={getPosterUrl(movie.poster_path)}
        alt={movie.title}
        fill
        sizes='100px'
        className='object-cover'
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  );
}
