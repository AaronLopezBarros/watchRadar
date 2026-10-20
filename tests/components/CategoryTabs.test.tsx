import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryTabs } from '@/src/components/CategoryTabs';

describe('CategoryTabs', () => {
  it('renders a tab for every category', () => {
    render(<CategoryTabs mediaType='movie' active='popular' locale='en' />);

    expect(screen.getByRole('link', { name: 'Popular' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Top' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New' })).toBeInTheDocument();
  });

  it('marks the active category and links to the right href', () => {
    render(<CategoryTabs mediaType='movie' active='top_rated' locale='en' />);

    const active = screen.getByRole('link', { name: 'Top' });
    expect(active).toHaveAttribute('aria-current', 'true');
    expect(active).toHaveAttribute('href', '/?category=top_rated');

    const inactive = screen.getByRole('link', { name: 'Popular' });
    expect(inactive).not.toHaveAttribute('aria-current');
    expect(inactive).toHaveAttribute('href', '/');
  });

  it('keeps the active filters when switching category', () => {
    render(
      <CategoryTabs mediaType='movie' active='popular' filters={{ genre: 'horror', streaming: true }} locale='en' />,
    );

    expect(screen.getByRole('link', { name: 'Popular' })).toHaveAttribute('href', '/?genre=horror&streaming=1');
    expect(screen.getByRole('link', { name: 'Top' })).toHaveAttribute(
      'href',
      '/?category=top_rated&genre=horror&streaming=1',
    );
  });

  it('drops streaming on the upcoming tab, where nothing is streaming yet', () => {
    render(
      <CategoryTabs mediaType='movie' active='popular' filters={{ genre: 'horror', streaming: true }} locale='en' />,
    );

    expect(screen.getByRole('link', { name: 'Upcoming' })).toHaveAttribute('href', '/?category=upcoming&genre=horror');
    expect(screen.getByRole('link', { name: 'New' })).toHaveAttribute(
      'href',
      '/?category=now_playing&genre=horror&streaming=1',
    );
  });

  it('offers the filters and the search for movies', () => {
    render(<CategoryTabs mediaType='movie' active='popular' locale='en' />);

    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search movies' })).toBeInTheDocument();
  });

  it('links the same tabs within series', () => {
    render(<CategoryTabs mediaType='tv' active='now_playing' locale='es' />);

    expect(screen.getByRole('link', { name: 'Populares' })).toHaveAttribute('href', '/?type=tv');
    expect(screen.getByRole('link', { name: 'Favoritas' })).toHaveAttribute('href', '/?type=tv&category=top_rated');
    expect(screen.getByRole('link', { name: 'Próximas' })).toHaveAttribute('href', '/?type=tv&category=upcoming');
    expect(screen.getByRole('link', { name: 'Nuevas', current: true })).toHaveAttribute(
      'href',
      '/?type=tv&category=now_playing',
    );
  });

  it('offers the filters and the search for series too', () => {
    render(<CategoryTabs mediaType='tv' active='popular' locale='en' />);

    expect(screen.getByRole('button', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search series' })).toBeInTheDocument();
  });

  it('lets the user switch between movies and series', () => {
    render(<CategoryTabs mediaType='tv' active='popular' locale='en' />);

    const group = screen.getByRole('group', { name: 'Content type' });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Series', current: true })).toBeInTheDocument();
  });
});
