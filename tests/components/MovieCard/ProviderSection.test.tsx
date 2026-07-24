import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ProviderSection } from '@/src/components/MovieCard/ProviderSection';
import { createProvider } from '@/tests/factories/movie.factory';

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

describe('ProviderSection', () => {
  it('shows all providers when maxVisible is not set', () => {
    const providers = [createProvider({ provider_name: 'Netflix' }), createProvider({ provider_name: 'HBO Max' })];
    render(<ProviderSection providers={providers} isLoading={false} />);

    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'HBO Max' })).toBeInTheDocument();
  });

  it('truncates to maxVisible and shows the extra count', () => {
    const providers = [
      createProvider({ provider_name: 'Netflix' }),
      createProvider({ provider_name: 'HBO Max' }),
      createProvider({ provider_name: 'Disney+' }),
    ];
    render(<ProviderSection providers={providers} isLoading={false} maxVisible={2} />);

    expect(screen.getByRole('img', { name: 'Netflix' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'HBO Max' })).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Disney+' })).not.toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('shows the not-available message when there are no providers', () => {
    render(<ProviderSection providers={[]} isLoading={false} />);

    expect(screen.getByText('Not available for streaming')).toBeInTheDocument();
  });
});
