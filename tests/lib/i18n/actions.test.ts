import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setLocale } from '@/lib/i18n/actions';

const setMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ set: setMock }),
}));

describe('setLocale', () => {
  beforeEach(() => {
    setMock.mockClear();
  });

  it('sets the locale cookie for a supported locale', async () => {
    await setLocale('es');

    expect(setMock).toHaveBeenCalledWith('locale', 'es', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
      httpOnly: true,
    });
  });

  it('does nothing for an unsupported locale', async () => {
    await setLocale('fr');

    expect(setMock).not.toHaveBeenCalled();
  });
});
