import { describe, expect, it } from 'vitest';

import { MEDIA_CONFIG } from '@/lib/api/tmdb/media';
import { getDictionary } from '@/lib/i18n/dictionary';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locale';

describe('getDictionary', () => {
  it.each(SUPPORTED_LOCALES)('returns a label for every movie category for locale %s', locale => {
    const dict = getDictionary(locale);

    MEDIA_CONFIG.movie.categories.forEach(category => {
      expect(dict.category[category]).toEqual(expect.any(String));
      expect(dict.category[category].length).toBeGreaterThan(0);
    });
  });

  it.each(SUPPORTED_LOCALES)('returns a label for every movie genre for locale %s', locale => {
    const dict = getDictionary(locale);

    MEDIA_CONFIG.movie.genres.forEach(genre => {
      expect(dict.genre[genre]).toEqual(expect.any(String));
      expect(dict.genre[genre].length).toBeGreaterThan(0);
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
