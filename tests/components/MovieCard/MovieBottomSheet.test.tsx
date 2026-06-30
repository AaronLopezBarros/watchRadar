import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MovieBottomSheet } from '@/src/components/MovieCard/MovieBottomSheet';
import { createMovie, createProvider } from '@/tests/factories/movie.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('MovieBottomSheet', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders movie title, year and rating', () => {
    const movie = createMovie({ title: 'Inception', release_date: '2010-07-16', vote_average: 8.8 });
    render(<MovieBottomSheet movie={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('★ 8.8')).toBeInTheDocument();
  });

  it('does not render year when release_date is empty', () => {
    const movie = createMovie({ release_date: '' });
    render(<MovieBottomSheet movie={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<MovieBottomSheet movie={createMovie()} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    await userEvent.click(screen.getByTestId('bottom-sheet-backdrop'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows provider logos', () => {
    const providers = [createProvider({ provider_name: 'Netflix' })];
    render(
      <MovieBottomSheet movie={createMovie()} providers={providers} isLoadingProviders={false} onClose={() => {}} />,
    );

    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('does not call onClose when clicking inside the sheet', async () => {
    const onClose = vi.fn();
    const movie = createMovie({ title: 'Inception' });
    render(<MovieBottomSheet movie={movie} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    await userEvent.click(screen.getByText('Inception'));

    expect(onClose).not.toHaveBeenCalled();
  });
});
