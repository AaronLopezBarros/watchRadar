import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MovieCategory, MovieGenre } from '@/lib/api/tmdb/types';
import { GenrePicker } from '@/src/components/GenrePicker/GenrePicker';
import { LocaleProvider } from '@/src/components/LocaleProvider';
import { SearchBar } from '@/src/components/SearchBar/SearchBar';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';

type HarnessProps = {
  category?: MovieCategory;
  genre?: MovieGenre;
};

function Harness({ category = 'popular', genre }: HarnessProps) {
  return (
    <LocaleProvider locale='es'>
      <SearchProvider>
        <GenrePicker category={category} genre={genre} />
        <SearchBar />
      </SearchProvider>
    </LocaleProvider>
  );
}

describe('GenrePicker', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('opens a sheet listing every genre linked within the current category', async () => {
    const user = userEvent.setup();
    render(<Harness category='top_rated' />);

    await user.click(screen.getByRole('button', { name: 'Géneros' }));

    const sheet = screen.getByRole('dialog', { name: 'Géneros' });
    expect(within(sheet).getAllByRole('link')).toHaveLength(12);
    expect(within(sheet).getByRole('link', { name: 'Todos', current: true })).toHaveAttribute(
      'href',
      '/?category=top_rated',
    );
    expect(within(sheet).getByRole('link', { name: 'Terror' })).toHaveAttribute(
      'href',
      '/?category=top_rated&genre=horror',
    );
  });

  it('closes the sheet after picking a genre', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Géneros' }));
    await user.click(screen.getByRole('link', { name: 'Comedia' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the active genre on the chip and marks it as current in the sheet', async () => {
    const user = userEvent.setup();
    render(<Harness genre='horror' />);

    await user.click(screen.getByRole('button', { name: 'Géneros: Terror' }));

    expect(screen.getByRole('link', { name: 'Terror', current: true })).toBeInTheDocument();
  });

  it('offers a link that removes the genre filter but keeps the category', () => {
    render(<Harness category='upcoming' genre='horror' />);

    expect(screen.getByRole('link', { name: 'Quitar filtro de género' })).toHaveAttribute(
      'href',
      '/?category=upcoming',
    );
  });

  it('closes the sheet on Escape and returns focus to the chip', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Géneros' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Géneros' })).toHaveFocus();
  });

  it('closes the sheet when tapping the backdrop', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Géneros' }));
    await user.click(screen.getByTestId('genre-picker-backdrop'));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('hides while the search is open and comes back with the same genre when it closes', async () => {
    const user = userEvent.setup();
    render(<Harness genre='horror' />);

    await user.click(screen.getByRole('button', { name: 'Buscar películas' }));

    expect(screen.queryByRole('button', { name: 'Géneros: Terror' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar búsqueda' }));

    expect(screen.getByRole('button', { name: 'Géneros: Terror' })).toBeInTheDocument();
  });
});
