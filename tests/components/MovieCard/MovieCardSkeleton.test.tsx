import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MovieCardSkeleton } from '@/src/components/MovieCard/MovieCardSkeleton';

describe('MovieCardSkeleton', () => {
  it('renders a skeleton element', () => {
    const { container } = render(<MovieCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
