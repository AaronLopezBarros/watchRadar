import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MovieCardInfo } from '@/src/components/MovieCard/MovieCardInfo';
import { createMovie, createProvider } from '@/tests/factories/movie.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const BASE_PROPS = {
  isHovered: false,
  flipX: false,
  providers: [],
  isLoadingProviders: false,
};

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
    it('is hidden and slides in from the left when not hovered and not flipped', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isHovered={false} flipX={false} />);

      const container = screen.getByTestId('movie-card-info-container');
      expect(container).toHaveClass('opacity-0');
      expect(container).toHaveClass('-translate-x-2');
    });

    it('is hidden and slides in from the right when not hovered and flipped', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isHovered={false} flipX={true} />);

      const container = screen.getByTestId('movie-card-info-container');
      expect(container).toHaveClass('opacity-0');
      expect(container).toHaveClass('translate-x-2');
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

  describe('providers', () => {
    it('shows loading skeleton when isLoadingProviders is true', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} isLoadingProviders={true} />);

      expect(document.querySelectorAll('.animate-pulse')).toHaveLength(3);
    });

    it('shows provider logos when providers are available', () => {
      const providers = [
        createProvider({ provider_id: 1, provider_name: 'Netflix' }),
        createProvider({ provider_id: 2, provider_name: 'HBO Max' }),
      ];
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} providers={providers} />);

      expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'HBO Max' })).toBeInTheDocument();
    });

    it('shows "No disponible en streaming" when providers is empty', () => {
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} providers={[]} />);

      expect(screen.getByText('Not available for streaming')).toBeInTheDocument();
    });

    it('shows overflow badge when providers exceed the visible limit', () => {
      const providers = Array.from({ length: 5 }, (_, index) =>
        createProvider({ provider_id: index + 1, provider_name: `Provider ${index + 1}` }),
      );
      render(<MovieCardInfo movie={createMovie()} {...BASE_PROPS} providers={providers} />);

      expect(screen.getByText('+1')).toBeInTheDocument();
      expect(screen.getAllByRole('img')).toHaveLength(4);
    });
  });
});
