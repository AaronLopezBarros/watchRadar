import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProviderSection } from '@/src/components/PosterCard/ProviderSection';
import { createProvider } from '@/tests/factories/media.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('ProviderSection', () => {
  it('shows every provider', () => {
    const providers = [createProvider({ provider_name: 'Netflix' }), createProvider({ provider_name: 'HBO Max' })];
    render(<ProviderSection providers={providers} isLoading={false} />);

    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'HBO Max' })).toBeInTheDocument();
  });

  it('shows the not-available message when there are no providers', () => {
    render(<ProviderSection providers={[]} isLoading={false} />);

    expect(screen.getByText('Not available for streaming')).toBeInTheDocument();
  });
});
