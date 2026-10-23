import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_REGION, getRegion } from '@/lib/region/getRegion';

const getHeaderMock = vi.fn();

vi.mock('next/headers', () => ({
  headers: () => Promise.resolve({ get: getHeaderMock }),
}));

describe('getRegion', () => {
  it("returns the visitor's country from the Vercel geolocation header", async () => {
    getHeaderMock.mockImplementation((name: string) => (name === 'x-vercel-ip-country' ? 'MX' : null));

    expect(await getRegion()).toBe('MX');
  });

  it('returns the default region when the header is missing, as in local dev', async () => {
    getHeaderMock.mockReturnValue(null);

    expect(await getRegion()).toBe(DEFAULT_REGION);
  });

  it.each(['mx', 'MEX', 'M1', ''])('returns the default region for a malformed country "%s"', async country => {
    getHeaderMock.mockReturnValue(country);

    expect(await getRegion()).toBe(DEFAULT_REGION);
  });
});
