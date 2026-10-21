import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';

const renderSheet = (onClose = vi.fn()) => {
  render(
    <BottomSheet label='Genres' onClose={onClose} tone='dark' desktop='modal'>
      <p>Sheet content</p>
      <ul aria-label='Genre list'>
        <li>Drama</li>
      </ul>
    </BottomSheet>,
  );
  return onClose;
};

// jsdom lays nothing out, so nothing scrolls unless told to.
const scrollGenreListDown = () => {
  Object.defineProperty(screen.getByRole('list', { name: 'Genre list' }), 'scrollTop', { value: 50 });
};

// userEvent can't produce touch events. Returns whether the move was left to the browser, i.e. not prevented.
const swipe = (target: Element, fromY: number, toY: number) => {
  fireEvent.touchStart(target, { touches: [{ clientY: fromY }] });
  const isMoveAllowed = fireEvent.touchMove(target, { touches: [{ clientY: toY }] });
  fireEvent.touchEnd(target, { touches: [] });
  return isMoveAllowed;
};

describe('BottomSheet', () => {
  it('renders its content inside a dialog named by the label', () => {
    renderSheet();

    expect(screen.getByRole('dialog', { name: 'Genres' })).toHaveTextContent('Sheet content');
  });

  it('closes when the backdrop is clicked', async () => {
    const onClose = renderSheet();

    await userEvent.click(screen.getByTestId('bottom-sheet-backdrop'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when clicking inside the sheet', async () => {
    const onClose = renderSheet();

    await userEvent.click(screen.getByText('Sheet content'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes on Escape', async () => {
    const onClose = renderSheet();

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('ignores other key presses', async () => {
    const onClose = renderSheet();

    await userEvent.keyboard('a');

    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when swiped down past the threshold from anywhere in the sheet', () => {
    const onClose = renderSheet();

    swipe(screen.getByText('Sheet content'), 0, 150);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when the drag does not pass the threshold', () => {
    const onClose = renderSheet();

    swipe(screen.getByText('Sheet content'), 0, 40);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('scrolls its content back up instead of closing when the content is scrolled down', () => {
    const onClose = renderSheet();
    scrollGenreListDown();

    expect(swipe(screen.getByText('Drama'), 0, 150)).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when swiped down from content at its top', () => {
    const onClose = renderSheet();

    swipe(screen.getByText('Drama'), 0, 150);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('lets its content scroll on a swipe up', () => {
    const onClose = renderSheet();

    expect(swipe(screen.getByText('Drama'), 150, 0)).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores a tap that does not move', () => {
    const onClose = renderSheet();

    fireEvent.touchStart(screen.getByText('Sheet content'), { touches: [{ clientY: 200 }] });
    fireEvent.touchEnd(screen.getByText('Sheet content'), { touches: [] });

    expect(onClose).not.toHaveBeenCalled();
  });

  describe('while its exit animation runs', () => {
    // jsdom runs no animations; a running CSS animation is what makes the sheet wait for animationend.
    const runExitAnimation = () => {
      HTMLElement.prototype.getAnimations = () => [{ animationName: 'slide-down' } as unknown as Animation];
    };

    afterEach(() => {
      Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
    });

    it.each([
      ['the backdrop is clicked', () => userEvent.click(screen.getByTestId('bottom-sheet-backdrop'))],
      ['Escape is pressed', () => userEvent.keyboard('{Escape}')],
      ['the sheet is swiped down', () => swipe(screen.getByText('Sheet content'), 0, 150)],
    ])('closes once the animation ends when %s', async (_case, close) => {
      runExitAnimation();
      const onClose = renderSheet();

      await close();
      expect(onClose).not.toHaveBeenCalled();

      fireEvent.animationEnd(screen.getByRole('dialog'));
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('closes only once when Escape is pressed again during the animation', async () => {
      runExitAnimation();
      const onClose = renderSheet();

      await userEvent.keyboard('{Escape}');
      await userEvent.keyboard('{Escape}');
      fireEvent.animationEnd(screen.getByRole('dialog'));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('ignores animations ending inside the sheet', async () => {
      runExitAnimation();
      const onClose = renderSheet();

      await userEvent.keyboard('{Escape}');
      fireEvent.animationEnd(screen.getByText('Sheet content'));

      expect(onClose).not.toHaveBeenCalled();
    });

    it('closes at once when only a transition is running, such as the snap back after a short drag', async () => {
      // A transition never fires animationend, so waiting for one would leave the sheet open.
      HTMLElement.prototype.getAnimations = () => [{ transitionProperty: 'transform' } as unknown as Animation];
      const onClose = renderSheet();

      await userEvent.keyboard('{Escape}');

      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
