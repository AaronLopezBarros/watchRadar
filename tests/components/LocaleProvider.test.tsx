import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getDictionary } from '@/lib/i18n/dictionary';
import { DEFAULT_LOCALE } from '@/lib/i18n/locale';
import { LocaleProvider, useLocale, useTranslations } from '@/src/components/LocaleProvider';

function Probe() {
  const dict = useTranslations();
  return <p>{dict.search.placeholder}</p>;
}

function LocaleProbe() {
  const locale = useLocale();
  return <p>{locale}</p>;
}

describe('LocaleProvider', () => {
  it('provides the dictionary for the given locale', () => {
    render(
      <LocaleProvider locale='es'>
        <Probe />
      </LocaleProvider>,
    );

    expect(screen.getByText(getDictionary('es').search.placeholder)).toBeInTheDocument();
  });

  it('falls back to the default locale dictionary when used without a provider', () => {
    render(<Probe />);

    expect(screen.getByText(getDictionary(DEFAULT_LOCALE).search.placeholder)).toBeInTheDocument();
  });

  it('provides the raw locale via useLocale', () => {
    render(
      <LocaleProvider locale='es'>
        <LocaleProbe />
      </LocaleProvider>,
    );

    expect(screen.getByText('es')).toBeInTheDocument();
  });

  it('falls back to the default locale when useLocale is used without a provider', () => {
    render(<LocaleProbe />);

    expect(screen.getByText(DEFAULT_LOCALE)).toBeInTheDocument();
  });
});
