import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { getDictionary } from '@/lib/i18n/dictionary';
import { DEFAULT_LOCALE } from '@/lib/i18n/locale';
import { LocaleProvider, useTranslations } from '@/src/components/LocaleProvider';

function Probe() {
  const dict = useTranslations();
  return <p>{dict.search.placeholder}</p>;
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
});
