import Image from 'next/image';

import { POSTER_W } from '@/components/PosterCard/constants';
import type { MediaItem } from '@/lib/api/tmdb/types';
import { getPosterUrl } from '@/lib/utils';

type ImageCardProps = {
  item: MediaItem;
  priority?: boolean;
};

export function ImageCard({ item, priority = false }: ImageCardProps) {
  return (
    <div className='relative h-full w-full'>
      <Image
        src={getPosterUrl(item.poster_path)}
        alt={item.title}
        fill
        sizes={`${POSTER_W}px`}
        className='object-cover'
        priority={priority}
        fetchPriority={priority ? 'high' : undefined}
      />
    </div>
  );
}
