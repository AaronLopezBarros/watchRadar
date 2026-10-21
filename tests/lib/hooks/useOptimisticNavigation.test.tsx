import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Link from 'next/link';
import { startTransition } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { useOptimisticNavigation } from '@/src/lib/hooks/useOptimisticNavigation';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    // A navigation that never finishes, like one still waiting for the server.
    push: (href: string) => {
      push(href);
      startTransition(() => new Promise(() => {}));
    },
  }),
}));

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
    expect(push).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it('navigates on a tap whose click iOS drops', () => {
    render(<Tabs />);
    const link = screen.getByRole('link', { name: 'second' });

    fireEvent.pointerDown(link, { ...touch, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(link, { ...touch, clientX: 12, clientY: 13 });

    expect(screen.getByRole('link', { name: 'second', current: true })).toBeInTheDocument();
    expect(push).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it('navigates only once on a tap whose click does follow', async () => {
    render(<Tabs />);

    await userEvent.pointer({ keys: '[TouchA]', target: screen.getByRole('link', { name: 'second' }) });

    expect(screen.getByRole('link', { name: 'second', current: true })).toBeInTheDocument();
    expect(push).toHaveBeenCalledExactlyOnceWith('/second');
  });

  it('ignores a touch release that ends a drag', () => {
    render(<Tabs />);
    const link = screen.getByRole('link', { name: 'second' });

    fireEvent.pointerDown(link, { ...touch, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(link, { ...touch, clientX: 10, clientY: 160 });

    expect(screen.getByRole('link', { name: 'first', current: true })).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('leaves mouse releases to the click', () => {
    render(<Tabs />);

    fireEvent.pointerUp(screen.getByRole('link', { name: 'second' }), { pointerType: 'mouse', isPrimary: true });

    expect(push).not.toHaveBeenCalled();
  });
});
