import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryTabs } from '@/src/components/CategoryTabs';

describe('CategoryTabs', () => {
  it('renders a tab for every movie category', () => {
    render(<CategoryTabs active='popular' />);

    expect(screen.getByRole('link', { name: 'Popular' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Top Rated' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Upcoming' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Now Playing' })).toBeInTheDocument();
  });

  it('marks the active category and links to the right href', () => {
    render(<CategoryTabs active='top_rated' />);

    const active = screen.getByRole('link', { name: 'Top Rated' });
    expect(active).toHaveAttribute('aria-current', 'true');
    expect(active).toHaveAttribute('href', '/?category=top_rated');

    const inactive = screen.getByRole('link', { name: 'Popular' });
    expect(inactive).not.toHaveAttribute('aria-current');
    expect(inactive).toHaveAttribute('href', '/');
  });
});
