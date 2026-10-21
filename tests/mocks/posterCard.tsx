import type { MediaItem } from '@/lib/api/tmdb/types';

type PosterCardProps = {
  item: Pick<MediaItem, 'id' | 'title'>;
  priority?: boolean;
  enterDelayMs?: number;
};

export function PosterCard({ item, priority, enterDelayMs }: PosterCardProps) {
  return (
    <div data-testid='poster-card' data-priority={priority} data-enter-delay={enterDelayMs}>
      {item.title}
    </div>
  );
}
