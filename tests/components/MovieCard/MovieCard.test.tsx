/* eslint-disable id-length */
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { Movie } from '@/src/lib/api/tmdb/types';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie();

vi.mock('@/src/components/MovieCard/ImageCard', () => ({
  ImageCard: ({ movie }: { movie: Movie }) => <div>{movie.backdrop_path}</div>,
}));

vi.mock('@/src/components/MovieCard/MovieCardInfo', () => ({
  MovieCardInfo: () => <div data-testid='movie-card-info-mock' />,
}));

describe('MovieCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('should render', () => {
    render(<MovieCard movie={movieMock} />);

    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  describe('handle', () => {
    const HOVER_DELAY = 175;

    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
      vi.stubGlobal('jest', {
        advanceTimersByTime: vi.advanceTimersByTime.bind(vi),
      });
      user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets flipX when there is not enough horizontal space', async () => {
      render(<MovieCard movie={movieMock} />);

      const article = screen.getByRole('article');

      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        value: 1000,
      });

      vi.spyOn(article, 'getBoundingClientRect').mockReturnValue({
        x: 800,
        y: 100,
        left: 800,
        top: 100,
        right: 850,
        bottom: 180,
        width: 50,
        height: 80,
        toJSON: () => {},
      } as DOMRect);

      await user.hover(article);
      act(() => vi.advanceTimersByTime(HOVER_DELAY));

      const container = screen.getByTestId('movie-card-container');

      expect(container).toHaveClass('right-0');
      expect(container).toHaveClass('flex-row-reverse');
    });

    it('sets flipY when there is not enough vertical space', async () => {
      render(<MovieCard movie={movieMock} />);

      const article = screen.getByRole('article');

      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 800,
      });

      vi.spyOn(article, 'getBoundingClientRect').mockReturnValue({
        x: 100,
        y: 600,
        left: 100,
        top: 600,
        right: 150,
        bottom: 680,
        width: 50,
        height: 80,
        toJSON: () => {},
      } as DOMRect);

      await user.hover(article);

      act(() => vi.advanceTimersByTime(HOVER_DELAY));

      const container = screen.getByTestId('movie-card-container');

      expect(container).toHaveClass('bottom-0');
    });
  });
});
