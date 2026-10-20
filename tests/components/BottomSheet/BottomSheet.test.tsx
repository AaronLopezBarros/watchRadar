import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';

const renderSheet = (onClose = vi.fn()) => {
  render(
    <BottomSheet label='Genres' onClose={onClose} tone='dark' desktop='modal'>
      <p>Sheet content</p>
    </BottomSheet>,
  );
  return onClose;
};

const drag = async (fromY: number, toY: number) => {
  const handle = screen.getByTestId('bottom-sheet-drag-handle');
  await userEvent.pointer([
    { target: handle, keys: '[TouchA>]', coords: { clientY: fromY } },
    { target: handle, coords: { clientY: toY } },
    { target: handle, keys: '[/TouchA]' },
  ]);
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

  it('closes when the drag handle is swiped down past the threshold', async () => {
    const onClose = renderSheet();

    await drag(0, 150);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when the drag does not pass the threshold', async () => {
    const onClose = renderSheet();

    await drag(0, 40);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores pointer move and release when no drag is in progress', async () => {
    const onClose = renderSheet();

    const handle = screen.getByTestId('bottom-sheet-drag-handle');
    await userEvent.pointer([
      { target: handle, coords: { clientY: 200 } },
      { target: handle, keys: '[TouchA>][/TouchA]', coords: { clientY: 200 } },
    ]);

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
      ['the handle is swiped down', () => drag(0, 150)],
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
