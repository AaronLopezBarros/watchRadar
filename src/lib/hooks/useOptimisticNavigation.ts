'use client';

import { useRouter } from 'next/navigation';
import { startTransition, useOptimistic } from 'react';

type NavigateEvent = { preventDefault: () => void };

export function useOptimisticNavigation<T>(value: T) {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const router = useRouter();

  // The link's own navigation runs outside this transition, which would drop the optimistic value at once.
  const navigate = (event: NavigateEvent, nextValue: T, href: string) => {
    event.preventDefault();
    startTransition(() => {
      setOptimisticValue(nextValue);
      router.push(href);
    });
  };

  return [optimisticValue, navigate] as const;
}
