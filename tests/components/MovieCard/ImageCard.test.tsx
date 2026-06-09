import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ImageCard } from '@/src/components/MovieCard/ImageCard';
import { createMovie } from '@/tests/factories/movie.factory';

const movieMock = createMovie();

vi.mock('next/image', () => ({
  default: () => <span>{movieMock.title}</span>,
}));

describe('ImageCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    render(<ImageCard movie={movieMock} isHovered={false} flipX={false} posterH={100} posterW={100} />);

    expect(screen.getByText(movieMock.title)).toBeInTheDocument();
  });

  describe('style', () => {
    it('should have the correct classes when isHovered and flipX are true', () => {
      render(<ImageCard movie={movieMock} isHovered={true} flipX={true} posterH={100} posterW={100} />);

      expect(screen.getByTestId('image-card-container')).toHaveClass('rounded-l-md');
    });

    it('should have the correct classes when isHovered is true and flipX are false', () => {
      render(<ImageCard movie={movieMock} isHovered={true} flipX={false} posterH={100} posterW={100} />);

      expect(screen.getByTestId('image-card-container')).toHaveClass('rounded-r-md');
    });

    it('should have the correct classes when isHovered is false', () => {
      render(<ImageCard movie={movieMock} isHovered={false} flipX={false} posterH={100} posterW={100} />);

      expect(screen.getByTestId('image-card-container')).toHaveClass('rounded-md');
    });
  });
});
