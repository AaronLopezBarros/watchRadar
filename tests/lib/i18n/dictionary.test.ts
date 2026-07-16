import { describe, expect, it } from 'vitest';

import { MOVIE_CATEGORIES } from '@/lib/api/tmdb/constants';
import { getDictionary } from '@/lib/i18n/dictionary';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locale';

describe('getDictionary', () => {
  it.each(SUPPORTED_LOCALES)('returns a label for every movie category for locale %s', locale => {
    const dict = getDictionary(locale);

    MOVIE_CATEGORIES.forEach(category => {
      expect(dict.category[category]).toEqual(expect.any(String));
      expect(dict.category[category].length).toBeGreaterThan(0);
    });
  });

  it('returns different translations for different locales', () => {
    const en = getDictionary('en');
    const es = getDictionary('es');

    expect(en.search.placeholder).not.toBe(es.search.placeholder);
    expect(en.provider.whereToWatch).not.toBe(es.provider.whereToWatch);
  });

  it('returns the English strings used elsewhere as defaults', () => {
    const dict = getDictionary('en');

    expect(dict.search.openAriaLabel).toBe('Search movies');
    expect(dict.search.placeholder).toBe('Search movies…');
    expect(dict.search.closeAriaLabel).toBe('Close search');
  });
});
