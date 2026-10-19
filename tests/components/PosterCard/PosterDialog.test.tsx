import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PosterDialog } from '@/src/components/PosterCard/PosterDialog';
import { createGenre, createMediaItem, createProvider } from '@/tests/factories/media.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('PosterDialog', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders movie title, year and rating', () => {
    const movie = createMediaItem({ title: 'Inception', release_date: '2010-07-16', vote_average: 8.8 });
    render(<PosterDialog item={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('★ 8.8')).toBeInTheDocument();
  });

  it('does not render year when release_date is empty', () => {
    const movie = createMediaItem({ release_date: '' });
    render(<PosterDialog item={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
  });

  it('lists the movie genres', () => {
    const movie = createMediaItem({
      genres: [createGenre({ id: 28, name: 'Acción' }), createGenre({ id: 878, name: 'Ciencia ficción' })],
    });
    render(<PosterDialog item={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    const genres = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(genres.map(genre => genre.textContent)).toEqual(['Acción', 'Ciencia ficción']);
  });

  it('shows no genre list when the movie has no genres', () => {
    render(
      <PosterDialog
        item={createMediaItem({ genres: [] })}
        providers={[]}
        isLoadingProviders={false}
        onClose={() => {}}
      />,
    );

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('shows provider logos', () => {
    const providers = [createProvider({ provider_name: 'Netflix' })];
    render(
      <PosterDialog item={createMediaItem()} providers={providers} isLoadingProviders={false} onClose={() => {}} />,
    );

    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('shows provider skeletons while loading', () => {
    render(<PosterDialog item={createMediaItem()} providers={[]} isLoadingProviders={true} onClose={() => {}} />);

    expect(screen.getAllByTestId('provider-skeleton')).toHaveLength(3);
  });

  it('labels the dialog with the movie title', () => {
    render(
      <PosterDialog
        item={createMediaItem({ title: 'Inception' })}
        providers={[]}
        isLoadingProviders={false}
        onClose={() => {}}
      />,
    );

    expect(screen.getByRole('dialog', { name: 'Inception' })).toBeInTheDocument();
  });

  it('offers to share the movie', () => {
    render(<PosterDialog item={createMediaItem()} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
  });
});
