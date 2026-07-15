import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie();

const BASE_PROPS = {
  isHovered: false,
  flipX: false,
  flipY: false,
};

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
    render(<ImageCard movie={movieMock} {...BASE_PROPS} />);

    expect(screen.getByAltText(movieMock.title)).toBeInTheDocument();
  });

  describe('scale', () => {
    it('shrinks the poster to the collapsed size when not hovered', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} isHovered={false} />);

      expect(screen.getByTestId('image-card-container')).toHaveStyle({ transform: 'scale(0.4)' });
    });

    it('shows the poster at full size when hovered', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} isHovered={true} />);

      expect(screen.getByTestId('image-card-container')).toHaveStyle({ transform: 'scale(1)' });
    });

    it('anchors the scale to the top-left corner by default', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} flipX={false} flipY={false} />);

      expect(screen.getByTestId('image-card-container')).toHaveStyle({ transformOrigin: 'left top' });
    });

    it('anchors the scale to the flipped corner when flipX and flipY are set', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} flipX={true} flipY={true} />);

      expect(screen.getByTestId('image-card-container')).toHaveStyle({ transformOrigin: 'right bottom' });
    });
  });

  describe('rounding', () => {
    it('should have the correct classes when isHovered and flipX are true', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} isHovered={true} flipX={true} />);

      expect(screen.getByTestId('image-card-container')).toHaveClass('rounded-r-md');
    });

    it('should have the correct classes when isHovered is true and flipX is false', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} isHovered={true} flipX={false} />);

      expect(screen.getByTestId('image-card-container')).toHaveClass('rounded-l-md');
    });

    it('should have the correct classes when isHovered is false', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} isHovered={false} />);

      expect(screen.getByTestId('image-card-container')).toHaveClass('rounded-md');
    });
  });

  describe('fetchPriority', () => {
    it('should not set fetchPriority when priority is not provided', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} />);

      expect(screen.getByAltText(movieMock.title)).not.toHaveAttribute('fetchpriority');
    });

    it('should not set fetchPriority when priority is false', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} priority={false} />);

      expect(screen.getByAltText(movieMock.title)).not.toHaveAttribute('fetchpriority');
    });

    it('should set fetchPriority to high when priority is true', () => {
      render(<ImageCard movie={movieMock} {...BASE_PROPS} priority={true} />);

      expect(screen.getByAltText(movieMock.title)).toHaveAttribute('fetchpriority', 'high');
    });
  });
});
