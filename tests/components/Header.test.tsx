import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Header } from '@/src/components/Header';

describe('Header', () => {
  it('renders the app name as a heading', () => {
    render(<Header />);

    expect(screen.getByRole('heading', { name: 'WatchRadar' })).toBeInTheDocument();
  });
});
