import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '@/src/components/LocaleProvider';
import { ShareButton } from '@/src/components/MovieCard/ShareButton';

const renderShareButton = () =>
  render(
    <LocaleProvider locale='es'>
      <ShareButton movieId={27205} title='Origen' />
    </LocaleProvider>,
  );

const mockDevice = ({ isTouch }: { isTouch: boolean }) => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { value: share, configurable: true });
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: isTouch && query === '(pointer: coarse)' }));
  return share;
};

describe('ShareButton', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    window.history.replaceState(null, '', '/?category=top_rated&genre=horror&movie=27205');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(navigator, 'share');
  });

  it('opens the native share sheet with a link to just the movie on touch devices', async () => {
    const share = mockDevice({ isTouch: true });
    renderShareButton();

    await user.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(share).toHaveBeenCalledWith({ title: 'Origen', url: `${window.location.origin}/?movie=27205` });
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('stays quiet when the share sheet is dismissed', async () => {
    mockDevice({ isTouch: true }).mockRejectedValue(new DOMException('Share canceled', 'AbortError'));
    renderShareButton();

    await user.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('copies a link to just the movie on desktop even when native sharing exists', async () => {
    const share = mockDevice({ isTouch: false });
    renderShareButton();

    await user.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/?movie=27205`);
    expect(screen.getByRole('status')).toHaveTextContent('Enlace copiado');
    expect(share).not.toHaveBeenCalled();
  });

  it('copies the link when native sharing is unavailable', async () => {
    renderShareButton();

    await user.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(await navigator.clipboard.readText()).toBe(`${window.location.origin}/?movie=27205`);
    expect(screen.getByRole('status')).toHaveTextContent('Enlace copiado');
  });

  it('hides the confirmation after a couple of seconds', async () => {
    renderShareButton();

    await user.click(screen.getByRole('button', { name: 'Compartir' }));
    act(() => vi.advanceTimersByTime(2000));

    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('tells the user when the link could not be copied', async () => {
    renderShareButton();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new DOMException('Denied', 'NotAllowedError'));

    await user.click(screen.getByRole('button', { name: 'Compartir' }));

    expect(screen.getByRole('status')).toHaveTextContent('No se pudo copiar el enlace');
  });
});
