import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BottomSheet } from '@/src/components/BottomSheet/BottomSheet';
import { DIRECTION_SLOP_PX, DRAG_CLOSE_THRESHOLD_PX } from '@/src/components/BottomSheet/hooks/useDragToClose';

const PAST_CLOSE_THRESHOLD = DRAG_CLOSE_THRESHOLD_PX * 1.5;
const SHORT_OF_CLOSE_THRESHOLD = DRAG_CLOSE_THRESHOLD_PX / 2;
const JITTER = DIRECTION_SLOP_PX / 4;

const renderSheet = (onClose = vi.fn()) => {
  render(
    <BottomSheet label='Genres' onClose={onClose} tone='dark' desktop='modal'>
      <p>Sheet content</p>
      <ul aria-label='Genre list' style={{ overflowY: 'auto' }}>
        <li>Drama</li>
      </ul>
    </BottomSheet>,
  );
  return onClose;
};

// jsdom lays nothing out, so the list overflows only when told to.
const makeGenreListOverflow = ({ scrollTop = 0 } = {}) => {
  Object.defineProperties(screen.getByRole('list', { name: 'Genre list' }), {
    scrollHeight: { value: 500 },
    clientHeight: { value: 100 },
    scrollTop: { value: scrollTop },
  });
};

// userEvent can't produce touch events. Each offset is how far the finger is from where it started, positive downwards.
// Returns whether the last move was left to the browser, i.e. not prevented.
const swipe = (target: Element, ...offsets: number[]) => {
  fireEvent.touchStart(target, { touches: [{ clientY: 0 }] });
  const movesAllowed = offsets.map(offset => fireEvent.touchMove(target, { touches: [{ clientY: offset }] }));
  fireEvent.touchEnd(target, { touches: [] });
  return movesAllowed.at(-1);
};

const stubScreenWidth = (isDesktop: boolean) => vi.stubGlobal('matchMedia', () => ({ matches: isDesktop }));

describe('BottomSheet', () => {
  beforeEach(() => {
    stubScreenWidth(false);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

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

  it('closes when swiped down past the threshold from anywhere in the sheet, without scrolling the page', () => {
    const onClose = renderSheet();

    expect(swipe(screen.getByText('Sheet content'), PAST_CLOSE_THRESHOLD)).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not close when the drag does not pass the threshold', () => {
    const onClose = renderSheet();

    swipe(screen.getByText('Sheet content'), SHORT_OF_CLOSE_THRESHOLD);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('scrolls its content back up instead of closing when the content is scrolled down', () => {
    const onClose = renderSheet();
    makeGenreListOverflow({ scrollTop: 50 });

    expect(swipe(screen.getByText('Drama'), PAST_CLOSE_THRESHOLD)).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes when swiped down from content at its top, without scrolling the content', () => {
    const onClose = renderSheet();
    makeGenreListOverflow();

    expect(swipe(screen.getByText('Drama'), PAST_CLOSE_THRESHOLD)).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('snaps back instead of closing when dragged back up before letting go', () => {
    const onClose = renderSheet();

    swipe(screen.getByText('Sheet content'), PAST_CLOSE_THRESHOLD, SHORT_OF_CLOSE_THRESHOLD);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('snaps back instead of closing when the system cancels the drag', () => {
    const onClose = renderSheet();
    const content = screen.getByText('Sheet content');

    fireEvent.touchStart(content, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(content, { touches: [{ clientY: PAST_CLOSE_THRESHOLD }] });
    fireEvent.touchCancel(content, { touches: [] });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('lets its content scroll on a swipe up', () => {
    const onClose = renderSheet();
    makeGenreListOverflow();

    expect(swipe(screen.getByText('Drama'), -PAST_CLOSE_THRESHOLD)).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('lets its content scroll on a swipe up that starts with a jitter down', () => {
    const onClose = renderSheet();
    makeGenreListOverflow();

    expect(swipe(screen.getByText('Drama'), JITTER, -PAST_CLOSE_THRESHOLD)).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps even the first small move outside scrollable content from scrolling the page', () => {
    renderSheet();

    expect(swipe(screen.getByText('Sheet content'), JITTER)).toBe(false);
  });

  it('keeps a swipe up outside scrollable content from scrolling the page', () => {
    const onClose = renderSheet();

    expect(swipe(screen.getByText('Sheet content'), -PAST_CLOSE_THRESHOLD)).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('drags from content that does not overflow, as it cannot scroll', () => {
    const onClose = renderSheet();

    expect(swipe(screen.getByText('Drama'), JITTER, PAST_CLOSE_THRESHOLD)).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('does not drag on screens wide enough for the modal or popover layout', () => {
    stubScreenWidth(true);
    const onClose = renderSheet();

    expect(swipe(screen.getByText('Sheet content'), PAST_CLOSE_THRESHOLD)).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('ignores a tap that does not move', () => {
    const onClose = renderSheet();

    swipe(screen.getByText('Sheet content'));

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
      ['the sheet is swiped down', () => swipe(screen.getByText('Sheet content'), PAST_CLOSE_THRESHOLD)],
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
