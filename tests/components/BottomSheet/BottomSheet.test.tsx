import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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
});
