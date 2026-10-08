import { describe, expect, it, vi } from 'vitest';

import { getLocale, getMetadataLocale } from '@/lib/i18n/getLocale';
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

describe('getMetadataLocale', () => {
  const WHATSAPP_UA = 'WhatsApp/2.23.20.0 A';
  const BROWSER_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/141.0 Safari/537.36';

  const mockRequest = ({ userAgent, acceptLanguage }: { userAgent: string; acceptLanguage?: string }) => {
    getCookieMock.mockReturnValue(undefined);
    getHeaderMock.mockImplementation((name: string) =>
      name === 'user-agent' ? userAgent : name === 'accept-language' ? (acceptLanguage ?? null) : null,
    );
  };

  it('uses the sharer language for link-preview bots', async () => {
    mockRequest({ userAgent: WHATSAPP_UA, acceptLanguage: 'en-US' });

    expect(await getMetadataLocale('es')).toBe('es');
  });

  it("uses the visitor's own language for people opening a shared link", async () => {
    mockRequest({ userAgent: BROWSER_UA, acceptLanguage: 'en-US' });

    expect(await getMetadataLocale('es')).toBe('en');
  });

  it('falls back to the usual detection for bots when the link names no language', async () => {
    mockRequest({ userAgent: WHATSAPP_UA, acceptLanguage: 'es-ES' });

    expect(await getMetadataLocale()).toBe('es');
  });
});
