import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { RatingBadge } from '@/src/components/MovieCard/RatingBadge';

describe('RatingBadge', () => {
  it('renders the rating rounded to one decimal', () => {
    render(<RatingBadge rating={7.456} />);
    expect(screen.getByText('★ 7.5')).toBeInTheDocument();
  });

  it('uses the high-rating color for ratings of 7 and above', () => {
    render(<RatingBadge rating={7} />);
    expect(screen.getByText('★ 7.0')).toHaveClass('text-emerald-600');
  });

  it('uses the mid-rating color for ratings between 5 and 7', () => {
    render(<RatingBadge rating={5} />);
    expect(screen.getByText('★ 5.0')).toHaveClass('text-amber-600');
  });

  it('uses the low-rating color for ratings below 5', () => {
    render(<RatingBadge rating={4.9} />);
    expect(screen.getByText('★ 4.9')).toHaveClass('text-rose-600');
  });
});
