import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Header } from '@/src/components/Header';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

describe('Header', () => {
  it('renders the app name as a heading', () => {
    render(<Header locale='en' />);

    expect(screen.getByRole('heading', { name: 'WatchRadar' })).toBeInTheDocument();
  });

  it('renders the tagline translated for the given locale', () => {
    render(<Header locale='es' />);

    expect(screen.getByText('Películas · Series · Dónde ver')).toBeInTheDocument();
  });

  it('lets the language be changed from the header', () => {
    render(<Header locale='es' />);

    expect(screen.getByRole('button', { name: 'Cambiar idioma: ES' })).toBeInTheDocument();
  });
});
