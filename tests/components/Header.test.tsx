import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Header } from '@/src/components/Header';

describe('Header', () => {
  it('renders the app name as a heading', () => {
    render(<Header locale='en' />);

    expect(screen.getByRole('heading', { name: 'WatchRadar' })).toBeInTheDocument();
  });

  it('renders the tagline translated for the given locale', () => {
    render(<Header locale='es' />);

    expect(screen.getByText('Películas · Valoraciones · Dónde ver')).toBeInTheDocument();
  });
});
