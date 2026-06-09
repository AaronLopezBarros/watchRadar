/* eslint-disable id-length */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovieCard } from '@/src/components/MovieCard/MovieCard';
import { Movie } from '@/src/lib/api/tmdb/types';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie();

vi.mock('@/src/components/MovieCard/ImageCard', () => ({
  ImageCard: ({ movie }: { movie: Movie }) => <div>{movie.backdrop_path}</div>,
}));

describe('MovieCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(<MovieCard movie={movieMock} />);

    expect(screen.getByText(movieMock.title)).toBeInTheDocument();
  });

  it('shows expanded content on mouse enter', async () => {
    const { container } = render(<MovieCard movie={movieMock} />);

    const article = container.querySelector('article')!;
    const panel = article.querySelector('.bg-white')!;

    expect(panel).toHaveClass('opacity-0');

    await userEvent.hover(article);

    expect(panel).toHaveClass('opacity-100');
  });

  it('hides expanded content on mouse leave', async () => {
    const { container } = render(<MovieCard movie={movieMock} />);

    const article = container.querySelector('article')!;
    const panel = article.querySelector('.bg-white')!;

    await userEvent.hover(article);

    expect(panel).toHaveClass('opacity-100');

    await userEvent.unhover(article);

    expect(panel).toHaveClass('opacity-0');
  });

  it('sets flipX when there is not enough horizontal space', async () => {
    const { container } = render(<MovieCard movie={movieMock} />);

    const article = container.querySelector('article')!;

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

    await userEvent.hover(article);

    const wrapper = article.firstElementChild;

    expect(wrapper).toHaveClass('right-0');
    expect(wrapper).toHaveClass('flex-row-reverse');
  });

  it('sets flipY when there is not enough vertical space', async () => {
    const { container } = render(<MovieCard movie={movieMock} />);

    const article = container.querySelector('article')!;

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

    await userEvent.hover(article);

    const wrapper = article.firstElementChild;

    expect(wrapper).toHaveClass('bottom-0');
  });
});
