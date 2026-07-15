import { describe, expect, it, vi } from 'vitest';

import { getLocale } from '@/lib/i18n/getLocale';
import { DEFAULT_LOCALE } from '@/lib/i18n/locale';

const getMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: getMock }),
}));

describe('getLocale', () => {
  it('returns the default locale when no cookie is set', async () => {
    getMock.mockReturnValue(undefined);

    expect(await getLocale()).toBe(DEFAULT_LOCALE);
  });

  it('returns the default locale when the cookie value is invalid', async () => {
    getMock.mockReturnValue({ value: 'fr' });

    expect(await getLocale()).toBe(DEFAULT_LOCALE);
  });

  it('returns the cookie value when it is a supported locale', async () => {
    getMock.mockReturnValue({ value: 'es' });

    expect(await getLocale()).toBe('es');
  });
});
