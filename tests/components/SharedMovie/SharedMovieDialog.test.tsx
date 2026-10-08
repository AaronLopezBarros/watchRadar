import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SharedMovieDialog } from '@/src/components/SharedMovie/SharedMovieDialog';
import { createMovie, createProvider } from '@/tests/factories/movie.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const movie = createMovie({ id: 27205, title: 'Inception' });

describe('SharedMovieDialog', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/?category=top_rated&movie=27205&lang=es');
  });

  it('shows the shared movie already open with its providers', () => {
    render(<SharedMovieDialog movie={movie} providers={[createProvider({ provider_name: 'Netflix' })]} />);

    expect(screen.getByRole('dialog', { name: 'Inception' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('closes and drops the movie and the sharer language from the URL', async () => {
    render(<SharedMovieDialog movie={movie} providers={[]} />);

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).toBe('?category=top_rated');
  });
});
