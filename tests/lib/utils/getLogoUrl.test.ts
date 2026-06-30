import { describe, expect, it } from 'vitest';

import { getLogoUrl } from '@/src/lib/utils';

describe('utils: getLogoUrl', () => {
  it('returns the correct TMDB logo URL with w92 size', () => {
    expect(getLogoUrl('/netflix.png')).toBe('https://image.tmdb.org/t/p/w92/netflix.png');
  });
});
