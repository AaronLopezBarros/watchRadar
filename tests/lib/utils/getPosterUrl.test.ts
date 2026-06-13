import { describe, expect, it } from 'vitest';

import { getPosterUrl } from '@/src/lib/utils';

describe('utils: getPosterUrl', () => {
  it('should return the url when path and size are provided', () => {
    expect(getPosterUrl('test', 'w342')).toStrictEqual('https://image.tmdb.org/t/p/w342test');
  });

  it('should return the fallback when path is not provided', () => {
    expect(getPosterUrl(null, 'w500')).toStrictEqual('/poster-placeholder.png');
  });

  it('should return the fallback size when it is not provided', () => {
    expect(getPosterUrl('test')).toStrictEqual('https://image.tmdb.org/t/p/w500test');
  });
});
