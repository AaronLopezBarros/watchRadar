import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SharedMediaDialog } from '@/src/components/SharedMedia/SharedMediaDialog';
import { createMediaItem, createProvider } from '@/tests/factories/media.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const movie = createMediaItem({ id: 27205, title: 'Inception' });

describe('SharedMediaDialog', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/?category=top_rated&movie=27205&lang=es');
  });

  it('shows the shared movie already open with its providers', () => {
    render(<SharedMediaDialog item={movie} providers={[createProvider({ provider_name: 'Netflix' })]} />);

    expect(screen.getByRole('dialog', { name: 'Inception' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
  });

  it('closes and drops the movie and the sharer language from the URL', async () => {
    render(<SharedMediaDialog item={movie} providers={[]} />);

    await userEvent.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.location.search).toBe('?category=top_rated');
  });

  it('closes a shared series back onto the series grid', async () => {
    window.history.replaceState(null, '', '/?type=tv&tv=1399&lang=es');
    render(
      <SharedMediaDialog
        item={createMediaItem({ mediaType: 'tv', id: 1399, title: 'Juego de tronos' })}
        providers={[]}
      />,
    );

    await userEvent.keyboard('{Escape}');

    expect(window.location.search).toBe('?type=tv');
  });
});
