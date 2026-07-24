import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie();

vi.mock('next/image', () => ({
  default: ({ alt, fetchPriority }: { alt: string; fetchPriority?: 'high' }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} fetchPriority={fetchPriority} />
  ),
}));

describe('ImageCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    render(<ImageCard movie={movieMock} />);

    expect(screen.getByAltText(movieMock.title)).toBeInTheDocument();
  });

  describe('fetchPriority', () => {
    it('should not set fetchPriority when priority is not provided', () => {
      render(<ImageCard movie={movieMock} />);

      expect(screen.getByAltText(movieMock.title)).not.toHaveAttribute('fetchpriority');
    });

    it('should not set fetchPriority when priority is false', () => {
      render(<ImageCard movie={movieMock} priority={false} />);

      expect(screen.getByAltText(movieMock.title)).not.toHaveAttribute('fetchpriority');
    });

    it('should set fetchPriority to high when priority is true', () => {
      render(<ImageCard movie={movieMock} priority={true} />);

      expect(screen.getByAltText(movieMock.title)).toHaveAttribute('fetchpriority', 'high');
    });
  });
});
