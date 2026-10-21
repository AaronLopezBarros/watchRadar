import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Link from 'next/link';
import { describe, expect, it, vi } from 'vitest';

import { TAP_SLOP_PX, useOptimisticNavigation } from '@/src/lib/hooks/useOptimisticNavigation';
import { routerPush } from '@/tests/mocks/nextNavigation';

vi.mock('next/navigation', () => import('@/tests/mocks/nextNavigation'));

// userEvent always follows a touch release with a click, so it can't show the click iOS drops, nor the click browsers
// skip after a drag.
const touch = { pointerType: 'touch', isPrimary: true };

function Tabs() {
  const [active, tabLinkProps] = useOptimisticNavigation('first');

  return ['first', 'second'].map(value => (
    <Link key={value} {...tabLinkProps(value, `/${value}`)} aria-current={value === active ? 'true' : undefined}>
      {value}
    </Link>
  ));
}

describe('useOptimisticNavigation', () => {
  it('selects a clicked link at once and navigates to it', async () => {
    render(<Tabs />);

    await userEvent.click(screen.getByRole('link', { name: 'second' }));

    expect(screen.getByRole('link', { name: 'second', current: true })).toBeInTheDocument();
    expect(routerPush).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it('navigates on a tap whose click iOS drops', () => {
    render(<Tabs />);
    const link = screen.getByRole('link', { name: 'second' });

    fireEvent.pointerDown(link, { ...touch, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(link, { ...touch, clientX: TAP_SLOP_PX / 2, clientY: TAP_SLOP_PX / 2 });

    expect(screen.getByRole('link', { name: 'second', current: true })).toBeInTheDocument();
    expect(routerPush).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it('navigates only once on a tap whose click does follow', async () => {
    render(<Tabs />);

    await userEvent.pointer({ keys: '[TouchA]', target: screen.getByRole('link', { name: 'second' }) });

    expect(screen.getByRole('link', { name: 'second', current: true })).toBeInTheDocument();
    expect(routerPush).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it('ignores a touch release that ends a drag', () => {
    render(<Tabs />);
    const link = screen.getByRole('link', { name: 'second' });

    fireEvent.pointerDown(link, { ...touch, clientX: 0, clientY: 0 });
    fireEvent.pointerUp(link, { ...touch, clientX: 0, clientY: TAP_SLOP_PX * 2 });

    expect(screen.getByRole('link', { name: 'first', current: true })).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
