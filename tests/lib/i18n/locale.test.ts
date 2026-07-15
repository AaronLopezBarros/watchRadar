import { describe, expect, it } from 'vitest';

import { isLocale } from '@/lib/i18n/locale';

describe('isLocale', () => {
  it('returns true for supported locales', () => {
    expect(isLocale('en')).toBe(true);
    expect(isLocale('es')).toBe(true);
  });

  it('returns false for unsupported or missing values', () => {
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
