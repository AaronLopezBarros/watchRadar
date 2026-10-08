import { describe, expect, it, vi } from 'vitest';

import { getLocale } from '@/lib/i18n/getLocale';
import { DEFAULT_LOCALE } from '@/lib/i18n/locale';

const getCookieMock = vi.fn();
const getHeaderMock = vi.fn();

vi.mock('next/headers', () => ({
  cookies: () => Promise.resolve({ get: getCookieMock }),
  headers: () => Promise.resolve({ get: getHeaderMock }),
}));

describe('getLocale', () => {
  it('returns the default locale when there is neither cookie nor Accept-Language', async () => {
    getCookieMock.mockReturnValue(undefined);
    getHeaderMock.mockReturnValue(null);

    expect(await getLocale()).toBe(DEFAULT_LOCALE);
  });

  it('returns the cookie value when it is a supported locale', async () => {
    getCookieMock.mockReturnValue({ value: 'es' });
    getHeaderMock.mockReturnValue('en-US,en;q=0.9');

    expect(await getLocale()).toBe('es');
  });

  it('falls back to the browser language when there is no cookie', async () => {
    getCookieMock.mockReturnValue(undefined);
    getHeaderMock.mockReturnValue('es-ES,es;q=0.9');

    expect(await getLocale()).toBe('es');
  });

  it('falls back to the browser language when the cookie value is invalid', async () => {
    getCookieMock.mockReturnValue({ value: 'fr' });
    getHeaderMock.mockReturnValue('es-ES');

    expect(await getLocale()).toBe('es');
  });

  it('returns the default locale when the browser asks only for unsupported languages', async () => {
    getCookieMock.mockReturnValue(undefined);
    getHeaderMock.mockReturnValue('fr-FR,de;q=0.8');

    expect(await getLocale()).toBe(DEFAULT_LOCALE);
  });
});
