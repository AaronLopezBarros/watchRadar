'use client';

import type Link from 'next/link';
import { useRouter } from 'next/navigation';
import { startTransition, useOptimistic, useRef, type ComponentProps } from 'react';

// Below the filter sheet's drag slop, so a short pull on the sheet that starts over a genre doesn't pick it.
export const TAP_SLOP_PX = 6;

type OptimisticLinkProps = Pick<ComponentProps<typeof Link>, 'href' | 'onNavigate' | 'onTouchStart' | 'onTouchEnd'>;

export function useOptimisticNavigation<T>(value: T) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const router = useRouter();
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
    onTouchStart: event => {
      const touch = event.touches[0];
      touchStartRef.current =
        event.touches.length === 1 ? { clientX: touch.clientX, clientY: touch.clientY } : undefined;
    },
    // Safari on iOS drops the click of a tap while the page is changing, e.g. while posters stream in, so taps navigate
    // here. Cancelling the touch also stops its click, which would otherwise land on whatever is under the finger once
    // the link is gone, such as a poster behind the closing filter sheet. A touch that ends a drag, such as pulling the
    // sheet down, isn't a tap.
    onTouchEnd: event => {
      const start = touchStartRef.current;
      touchStartRef.current = undefined;
      const touch = event.changedTouches[0];
      if (!start || !touch || Math.hypot(touch.clientX - start.clientX, touch.clientY - start.clientY) > TAP_SLOP_PX) {
        return;
      }
      event.preventDefault();
      navigate(nextValue, href, onSelect);
    },
    // The link's own navigation runs outside this transition, which would drop the optimistic value at once.
    onNavigate: event => {
      event.preventDefault();
      navigate(nextValue, href, onSelect);
    },
  });

  return [optimisticValue, linkProps] as const;
}
