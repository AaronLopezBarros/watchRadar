import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ImageCard } from '@/src/components/PosterCard/ImageCard';
import { createMediaItem } from '@/tests/factories/media.factory';

const movieMock = createMediaItem();


describe('ImageCard', () => {
  afterEach(() => {
    cleanup();
  });

  it('should render', () => {
    render(<ImageCard item={movieMock} />);

    expect(screen.getByAltText(movieMock.title)).toBeInTheDocument();
  });

  describe('fetchPriority', () => {
    it('should not set fetchPriority when priority is not provided', () => {
      render(<ImageCard item={movieMock} />);

      expect(screen.getByAltText(movieMock.title)).not.toHaveAttribute('fetchpriority');
    });

    it('should not set fetchPriority when priority is false', () => {
      render(<ImageCard item={movieMock} priority={false} />);

      expect(screen.getByAltText(movieMock.title)).not.toHaveAttribute('fetchpriority');
    });

    it('should set fetchPriority to high when priority is true', () => {
      render(<ImageCard item={movieMock} priority={true} />);

      expect(screen.getByAltText(movieMock.title)).toHaveAttribute('fetchpriority', 'high');
    });
  });
});
