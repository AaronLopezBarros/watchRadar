import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Link from 'next/link';
import { describe, expect, it, vi } from 'vitest';

import { TAP_SLOP_PX, useOptimisticNavigation } from '@/lib/hooks/useOptimisticNavigation';
import { routerPush } from '@/tests/mocks/nextNavigation';

vi.mock('next/navigation', () => import('@/tests/mocks/nextNavigation'));

// userEvent has no touch events, which taps are handled on.
const tap = (target: Element, { endsAt = 0 } = {}) => {
  fireEvent.touchStart(target, { touches: [{ clientX: 0, clientY: 0 }] });
  // Whether the browser may still click: false once the tap's own click is cancelled.
  return fireEvent.touchEnd(target, { touches: [], changedTouches: [{ clientX: 0, clientY: endsAt }] });
};

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

  it('navigates on a tap without waiting for its click, which iOS may drop', () => {
    render(<Tabs />);

    tap(screen.getByRole('link', { name: 'second' }), { endsAt: TAP_SLOP_PX / 2 });

    expect(screen.getByRole('link', { name: 'second', current: true })).toBeInTheDocument();
    expect(routerPush).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it("cancels a tap's own click so it can't land on what is left under the finger", () => {
    render(<Tabs />);

    expect(tap(screen.getByRole('link', { name: 'second' }))).toBe(false);
  });

  it('ignores a touch that ends a drag', () => {
    render(<Tabs />);

    expect(tap(screen.getByRole('link', { name: 'second' }), { endsAt: TAP_SLOP_PX * 2 })).toBe(true);
    expect(screen.getByRole('link', { name: 'first', current: true })).toBeInTheDocument();
    expect(routerPush).not.toHaveBeenCalled();
  });
});
