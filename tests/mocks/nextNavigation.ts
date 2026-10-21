import { startTransition } from 'react';
import { vi } from 'vitest';

export const routerPush = vi.fn();
export const routerRefresh = vi.fn();

export const useRouter = () => ({
  push: (href: string) => {
    routerPush(href);
    // A navigation that never finishes, like one still waiting for the server.
    startTransition(() => new Promise(() => {}));
  },
  refresh: routerRefresh,
});
