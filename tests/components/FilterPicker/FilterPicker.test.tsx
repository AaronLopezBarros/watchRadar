import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { MovieCategory, MovieFilters } from '@/lib/api/tmdb/types';
import { FilterPicker } from '@/src/components/FilterPicker/FilterPicker';
import { LocaleProvider } from '@/src/components/LocaleProvider';
import { SearchBar } from '@/src/components/SearchBar/SearchBar';
import { SearchProvider } from '@/src/components/SearchBar/SearchProvider';

type HarnessProps = {
  category?: MovieCategory;
  filters?: MovieFilters;
};

function Harness({ category = 'popular', filters = {} }: HarnessProps) {
  return (
    <LocaleProvider locale='es'>
      <SearchProvider>
        <FilterPicker category={category} filters={filters} />
        <SearchBar />
      </SearchProvider>
    </LocaleProvider>
  );
}

describe('FilterPicker', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  });

  it('opens a sheet listing every genre linked within the current category', async () => {
    const user = userEvent.setup();
    render(<Harness category='top_rated' />);

    await user.click(screen.getByRole('button', { name: 'Filtros' }));

    const sheet = screen.getByRole('dialog', { name: 'Filtros' });
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(12);
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

    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    await user.click(screen.getByRole('link', { name: 'Comedia' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('summarizes the active filters on the chip and marks the genre as current in the sheet', async () => {
    const user = userEvent.setup();
    render(<Harness filters={{ genre: 'horror', streaming: true }} />);

    const chip = screen.getByRole('button', { name: 'Filtros: Terror, Streaming' });
    expect(chip).toHaveTextContent('Terror · Streaming');

    await user.click(chip);

    expect(screen.getByRole('link', { name: 'Terror', current: true })).toBeInTheDocument();
  });

  it('offers a link that clears every filter but keeps the category', () => {
    render(<Harness category='top_rated' filters={{ genre: 'horror', streaming: true }} />);

    expect(screen.getByRole('link', { name: 'Quitar filtros' })).toHaveAttribute('href', '/?category=top_rated');
  });

  it('toggles streaming while keeping the genre and the sheet open', async () => {
    const user = userEvent.setup();
    render(<Harness filters={{ genre: 'horror' }} />);

    await user.click(screen.getByRole('button', { name: 'Filtros: Terror' }));
    const toggle = screen.getByRole('switch', { name: 'Solo en streaming', checked: false });
    expect(toggle).toHaveAttribute('href', '/?genre=horror&streaming=1');

    await user.click(toggle);

    expect(screen.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
  });

  it('keeps streaming in the genre links when it is on', async () => {
    const user = userEvent.setup();
    render(<Harness filters={{ streaming: true }} />);

    await user.click(screen.getByRole('button', { name: 'Filtros: Streaming' }));

    expect(screen.getByRole('switch', { name: 'Solo en streaming', checked: true })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Terror' })).toHaveAttribute('href', '/?genre=horror&streaming=1');
  });

  it('hides the streaming toggle on cinema categories', async () => {
    const user = userEvent.setup();
    render(<Harness category='now_playing' />);

    await user.click(screen.getByRole('button', { name: 'Filtros' }));

    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });

  it('closes the sheet on Escape and returns focus to the chip', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await user.click(screen.getByRole('button', { name: 'Filtros' }));
    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filtros' })).toHaveFocus();
  });

  it('hides while the search is open and comes back with the same filters when it closes', async () => {
    const user = userEvent.setup();
    render(<Harness filters={{ genre: 'horror' }} />);

    await user.click(screen.getByRole('button', { name: 'Buscar películas' }));

    expect(screen.queryByRole('button', { name: 'Filtros: Terror' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cerrar búsqueda' }));

    expect(screen.getByRole('button', { name: 'Filtros: Terror' })).toBeInTheDocument();
  });
});
