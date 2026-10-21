'use client';

import type Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useOptimistic, useRef, type ComponentProps } from 'react';

const TAP_CLICK_WINDOW_MS = 1000;
// Below the filter sheet's drag slop, so a short pull on the sheet that starts over a genre doesn't pick it.
export const TAP_SLOP_PX = 6;

type OptimisticLinkProps = Pick<ComponentProps<typeof Link>, 'href' | 'onNavigate' | 'onPointerDown' | 'onPointerUp'>;

export function useOptimisticNavigation<T>(value: T) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const router = useRouter();
  const lastTapAtRef = useRef(-Infinity);
  const touchStartRef = useRef<{ clientX: number; clientY: number }>(undefined);

  const navigate = (nextValue: T, href: string, onSelect?: () => void) => {
    onSelect?.();
    startTransition(() => {
      setOptimisticValue(nextValue);
      router.push(href);
    });
  };

  const linkProps = (nextValue: T, href: string, onSelect?: () => void): OptimisticLinkProps => ({
    href,
    onPointerDown: event => {
      touchStartRef.current = { clientX: event.clientX, clientY: event.clientY };
    },
    // Safari on iOS drops the click of a tap while the page is changing, e.g. while posters stream in, so taps
    // navigate on release and the click that does follow is skipped. A release that ends a drag, such as pulling
    // the filter sheet down, isn't a tap.
    onPointerUp: event => {
      const start = touchStartRef.current;
      touchStartRef.current = undefined;
      if (event.pointerType !== 'touch' || !event.isPrimary || !start) return;
      if (Math.hypot(event.clientX - start.clientX, event.clientY - start.clientY) > TAP_SLOP_PX) return;
      lastTapAtRef.current = performance.now();
      navigate(nextValue, href, onSelect);
    },
    // The link's own navigation runs outside this transition, which would drop the optimistic value at once.
    onNavigate: event => {
      event.preventDefault();
      if (performance.now() - lastTapAtRef.current < TAP_CLICK_WINDOW_MS) return;
      navigate(nextValue, href, onSelect);
    },
  });

  return [optimisticValue, linkProps] as const;
}
