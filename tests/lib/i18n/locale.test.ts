import { describe, expect, it } from 'vitest';

import { isLocale, matchAcceptLanguage } from '@/lib/i18n/locale';

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

describe('matchAcceptLanguage', () => {
  it('matches a regional variant to its base language', () => {
    expect(matchAcceptLanguage('es-MX')).toBe('es');
  });

  it('picks the supported language with the highest weight', () => {
    expect(matchAcceptLanguage('en;q=0.5,es;q=0.9')).toBe('es');
  });

  it('keeps the header order between languages with the same weight', () => {
    expect(matchAcceptLanguage('en-GB,es')).toBe('en');
  });

  it('skips unsupported languages ranked above a supported one', () => {
    expect(matchAcceptLanguage('fr-FR,fr;q=0.9,es;q=0.8')).toBe('es');
  });

  it('ignores languages the browser explicitly rejects with q=0', () => {
    expect(matchAcceptLanguage('es;q=0,en;q=0.1')).toBe('en');
  });

  it('is case-insensitive and tolerates spaces', () => {
    expect(matchAcceptLanguage(' ES-es ; q=0.8 ')).toBe('es');
  });

  it('returns undefined when no supported language is accepted', () => {
    expect(matchAcceptLanguage('fr-FR,*;q=0.5')).toBeUndefined();
    expect(matchAcceptLanguage('')).toBeUndefined();
    expect(matchAcceptLanguage(null)).toBeUndefined();
  });
});
