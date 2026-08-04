import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MovieDialog } from '@/src/components/MovieCard/MovieDialog';
import { createMovie, createProvider } from '@/tests/factories/movie.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('MovieDialog', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders movie title, year and rating', () => {
    const movie = createMovie({ title: 'Inception', release_date: '2010-07-16', vote_average: 8.8 });
    render(<MovieDialog movie={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.getByText('Inception')).toBeInTheDocument();
    expect(screen.getByText('2010')).toBeInTheDocument();
    expect(screen.getByText('★ 8.8')).toBeInTheDocument();
  });

  it('does not render year when release_date is empty', () => {
    const movie = createMovie({ release_date: '' });
    render(<MovieDialog movie={movie} providers={[]} isLoadingProviders={false} onClose={() => {}} />);

    expect(screen.queryByText(/^\d{4}$/)).not.toBeInTheDocument();
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    render(<MovieDialog movie={createMovie()} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    await userEvent.click(screen.getByTestId('movie-dialog-backdrop'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows provider logos', () => {
    const providers = [createProvider({ provider_name: 'Netflix' })];
    render(
      <MovieDialog movie={createMovie()} providers={providers} isLoadingProviders={false} onClose={() => {}} />,
    );

    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('shows provider skeletons while loading', () => {
    render(<MovieDialog movie={createMovie()} providers={[]} isLoadingProviders={true} onClose={() => {}} />);

    expect(screen.getAllByTestId('provider-skeleton')).toHaveLength(3);
  });

  it('does not call onClose when clicking inside the sheet', async () => {
    const onClose = vi.fn();
    const movie = createMovie({ title: 'Inception' });
    render(<MovieDialog movie={movie} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    await userEvent.click(screen.getByText('Inception'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when the drag handle is swiped down past the threshold', async () => {
    const onClose = vi.fn();
    render(<MovieDialog movie={createMovie()} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    const handle = screen.getByTestId('movie-dialog-drag-handle');
    await userEvent.pointer([
      { target: handle, keys: '[TouchA>]', coords: { clientY: 0 } },
      { target: handle, coords: { clientY: 150 } },
      { target: handle, keys: '[/TouchA]' },
    ]);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not call onClose when the drag does not pass the threshold', async () => {
    const onClose = vi.fn();
    render(<MovieDialog movie={createMovie()} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    const handle = screen.getByTestId('movie-dialog-drag-handle');
    await userEvent.pointer([
      { target: handle, keys: '[TouchA>]', coords: { clientY: 0 } },
      { target: handle, coords: { clientY: 40 } },
      { target: handle, keys: '[/TouchA]' },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores pointer move and release when no drag is in progress', async () => {
    const onClose = vi.fn();
    render(<MovieDialog movie={createMovie()} providers={[]} isLoadingProviders={false} onClose={onClose} />);

    const handle = screen.getByTestId('movie-dialog-drag-handle');
    await userEvent.pointer([
      { target: handle, coords: { clientY: 200 } },
      { target: handle, keys: '[TouchA>][/TouchA]', coords: { clientY: 200 } },
    ]);

    expect(onClose).not.toHaveBeenCalled();
  });
});
