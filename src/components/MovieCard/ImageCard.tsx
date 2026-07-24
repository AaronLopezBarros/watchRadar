import Image from 'next/image';

import { POSTER_W } from '@/src/components/MovieCard/constants';
import { Movie } from '@/src/lib/api/tmdb/types';
import { getPosterUrl } from '@/src/lib/utils';

type ImageCardProps = {
  movie: Movie;
  priority?: boolean;
};

export function ImageCard({ movie, priority = false }: ImageCardProps) {
  return (
    <div data-testid='image-card-container' className='relative h-full w-full'>
      <Image
        src={getPosterUrl(movie.poster_path)}
        alt={movie.title}
        fill
        sizes={`${POSTER_W}px`}
        className='object-cover'
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  );
}
