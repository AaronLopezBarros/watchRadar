import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PosterCardSkeleton } from '@/src/components/PosterCard/PosterCardSkeleton';

describe('PosterCardSkeleton', () => {
  it('renders a skeleton element', () => {
    const { container } = render(<PosterCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
