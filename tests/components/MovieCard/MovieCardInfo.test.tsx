import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { MovieCardInfo } from '@/src/components/MovieCard/MovieCardInfo';
import { createMovie } from '@/tests/factories/movie.factory';

const BASE_PROPS = { isHovered: false, flipX: false, posterH: 320, posterW: 200 };

describe('MovieCardInfo', () => {
  afterEach(() => {
    cleanup();
  });

  describe('content', () => {
    it('renders the movie title', () => {
      const movie = createMovie({ title: 'Inception' });
      render(<MovieCardInfo movie={movie} {...BASE_PROPS} />);

      expect(screen.getByRole('heading', { name: 'Inception' })).toBeInTheDocument();
    });

    it('renders the year extracted from release_date', () => {
      const movie = createMovie({ release_date: '2010-07-16' });
      render(<MovieCardInfo movie={movie} {...BASE_PROPS} />);

      expect(screen.getByText('2010')).toBeInTheDocument();
    });

    it('does not render year when release_date is empty', () => {
      const movie = createMovie({ release_date: '' });
      render(<MovieCardInfo movie={movie} {...BASE_PROPS} />);

      expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
    });

    it('renders the movie overview', () => {
      const movie = createMovie({ overview: 'A mind-bending thriller.' });
      render(<MovieCardInfo movie={movie} {...BASE_PROPS} />);

      expect(screen.getByText('A mind-bending thriller.')).toBeInTheDocument();
    });

    it('renders the vote average formatted to one decimal', () => {
      const movie = createMovie({ vote_average: 8.7 });
      render(<MovieCardInfo movie={movie} {...BASE_PROPS} />);

      expect(screen.getByText('★ 8.7')).toBeInTheDocument();
    });
  });

  describe('visibility', () => {
    it('is hidden when not hovered', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isHovered={false} />);

      expect(screen.getByTestId('movie-card-info-container')).toHaveClass('opacity-0');
    });

    it('is visible when hovered', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isHovered={true} />);

      expect(screen.getByTestId('movie-card-info-container')).toHaveClass('opacity-100');
    });
  });

  describe('flip direction', () => {
    it('applies rounded-r-md when not flipped', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isHovered={true} flipX={false} />);

      expect(screen.getByTestId('movie-card-info-container')).toHaveClass('rounded-r-md');
    });

    it('applies rounded-l-md when flipped', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isHovered={true} flipX={true} />);

      expect(screen.getByTestId('movie-card-info-container')).toHaveClass('rounded-l-md');
    });
  });
});
