import { cn } from '@/src/lib/utils';

const HIGH_RATING_THRESHOLD = 7;
const MID_RATING_THRESHOLD = 5;

type RatingBadgeProps = {
  rating: number;
};

const getRatingColorClasses = (rating: number) => {
  if (rating >= HIGH_RATING_THRESHOLD) return 'bg-emerald-500/15 text-emerald-600';
  if (rating >= MID_RATING_THRESHOLD) return 'bg-amber-500/15 text-amber-600';
  return 'bg-rose-500/15 text-rose-600';
};

export function RatingBadge({ rating }: RatingBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center rounded-full px-2 py-0.5 text-xs font-semibold',
        getRatingColorClasses(rating),
      )}
    >
      ★ {rating.toFixed(1)}
    </span>
  );
}
