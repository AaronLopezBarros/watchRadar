import { POSTER_H, POSTER_W } from '@/src/components/PosterCard/constants';

export function PosterCardSkeleton() {
  return (
    <div
      className='w-full shrink-0 animate-pulse rounded-md bg-white/10 sm:w-27.5'
      style={{ aspectRatio: `${POSTER_W} / ${POSTER_H}` }}
    />
  );
}
