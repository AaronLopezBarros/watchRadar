import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { GenreBadge } from '@/src/components/MovieCard/GenreBadge';

describe('GenreBadge', () => {
  it('renders the genre name', () => {
    render(<GenreBadge name='Ciencia ficción' />);
    expect(screen.getByText('Ciencia ficción')).toBeInTheDocument();
  });
});
