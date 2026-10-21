import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '@/components/LocaleProvider';
import { MediaTypeToggle } from '@/components/MediaTypeToggle/MediaTypeToggle';
import { SearchBar } from '@/components/SearchBar/SearchBar';
import { SearchProvider } from '@/components/SearchBar/SearchProvider';
import type { MediaCategory, MediaType } from '@/lib/api/tmdb/types';

vi.mock('next/navigation', () => import('@/tests/mocks/nextNavigation'));

type HarnessProps = {
  active: MediaType;
  category?: MediaCategory;
  streaming?: boolean;
};

function Harness({ active, category = 'popular', streaming }: HarnessProps) {
  return (
    <LocaleProvider locale='es'>
      <SearchProvider>
        <MediaTypeToggle active={active} category={category} streaming={streaming} />
        <SearchBar mediaType='movie' />
      </SearchProvider>
    </LocaleProvider>
  );
}

describe('MediaTypeToggle', () => {
  it('links each media type within the current tab', () => {
    render(<Harness active='movie' category='upcoming' />);

    expect(screen.getByRole('group', { name: 'Tipo de contenido' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Películas' })).toHaveAttribute('href', '/?category=upcoming');
    expect(screen.getByRole('link', { name: 'Series' })).toHaveAttribute('href', '/?type=tv&category=upcoming');
  });

  it('keeps streaming when switching', () => {
    render(<Harness active='movie' category='top_rated' streaming />);

    expect(screen.getByRole('link', { name: 'Películas' })).toHaveAttribute('href', '/?category=top_rated&streaming=1');
    expect(screen.getByRole('link', { name: 'Series' })).toHaveAttribute(
      'href',
      '/?type=tv&category=top_rated&streaming=1',
    );
  });

  it('marks the active media type', () => {
    render(<Harness active='tv' />);

    expect(screen.getByRole('link', { name: 'Series', current: true })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Películas', current: false })).toBeInTheDocument();
  });

  it('steps aside while a search is open', async () => {
    const user = userEvent.setup();
    render(<Harness active='movie' />);

    await user.click(screen.getByRole('button', { name: 'Buscar películas' }));

    expect(screen.queryByRole('group', { name: 'Tipo de contenido' })).not.toBeInTheDocument();
  });

  it('marks the tapped media type as current at once, before the page updates', async () => {
    render(<Harness active='movie' />);

    await userEvent.click(screen.getByRole('link', { name: 'Series' }));

    expect(screen.getByRole('link', { name: 'Series', current: true })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Películas', current: false })).toBeInTheDocument();
  });
});
