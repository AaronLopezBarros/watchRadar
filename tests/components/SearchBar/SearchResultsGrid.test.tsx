import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { searchMedia } from '@/lib/api/tmdb/actions';
import { LocaleProvider } from '@/src/components/LocaleProvider';
import { SearchResultsGrid } from '@/src/components/SearchBar/SearchResultsGrid';
import { createMediaItem } from '@/tests/factories/media.factory';

vi.mock('@/lib/api/tmdb/actions', () => ({
  searchMedia: vi.fn(),
}));

vi.mock('@/src/components/PosterCard/PosterCard', () => ({
  PosterCard: ({ item }: { item: { id: number; title: string } }) => <div data-testid='poster-card'>{item.title}</div>,
}));

vi.mock('@/src/components/PosterCard/PosterCardSkeleton', () => ({
  PosterCardSkeleton: () => <div data-testid='skeleton' />,
}));

describe('SearchResultsGrid', () => {
  let observerCallback: IntersectionObserverCallback | undefined;

  const triggerIntersection = (isIntersecting: boolean) =>
    observerCallback!([{ isIntersecting }] as IntersectionObserverEntry[], {} as IntersectionObserver);

  beforeEach(() => {
    observerCallback = undefined;

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          observerCallback = cb;
        }
        observe = vi.fn();
        disconnect = vi.fn();
      },
    );
  });

  it('shows skeletons before the first page resolves', () => {
    render(<SearchResultsGrid mediaType='movie' query='batman' />);

    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0);
  });

  it('fetches and renders results for the given query and locale without needing the sentinel to intersect', async () => {
    vi.mocked(searchMedia).mockResolvedValue([createMediaItem({ id: 1, title: 'Batman' })]);
    render(
      <LocaleProvider locale='es'>
        <SearchResultsGrid mediaType='movie' query='batman' />
      </LocaleProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('poster-card')).toHaveTextContent('Batman'));
    expect(searchMedia).toHaveBeenCalledWith('movie', 'batman', 1, 'es');
  });

  it('loads the next page when the sentinel intersects after the first page has loaded', async () => {
    vi.mocked(searchMedia)
      .mockResolvedValueOnce([createMediaItem({ id: 1, title: 'Batman' })])
      .mockResolvedValueOnce([createMediaItem({ id: 2, title: 'Batman Returns' })]);
    render(<SearchResultsGrid mediaType='movie' query='batman' />);

    await waitFor(() => expect(screen.getAllByTestId('poster-card')).toHaveLength(1));

    act(() => triggerIntersection(true));

    await waitFor(() => expect(screen.getAllByTestId('poster-card')).toHaveLength(2));
    expect(searchMedia).toHaveBeenCalledWith('movie', 'batman', 2, 'en');
  });

  it('shows an empty state when the search resolves with no results', async () => {
    vi.mocked(searchMedia).mockResolvedValue([]);
    render(<SearchResultsGrid mediaType='movie' query='batman' />);

    const message = await screen.findByText(/No results found for/);
    expect(message).toHaveTextContent('batman');
  });

  it('shows an error state with a retry action, and recovers on retry', async () => {
    vi.mocked(searchMedia).mockRejectedValueOnce(new Error('boom'));
    render(<SearchResultsGrid mediaType='movie' query='batman' />);

    const retryButton = await screen.findByRole('button', { name: 'Retry' });
    expect(screen.getByText('The search could not be completed.')).toBeInTheDocument();

    vi.mocked(searchMedia).mockResolvedValueOnce([createMediaItem({ id: 1, title: 'Batman' })]);
    await userEvent.click(retryButton);

    await waitFor(() => expect(screen.getByTestId('poster-card')).toHaveTextContent('Batman'));
  });

  it('searches series when the media type is series', async () => {
    vi.mocked(searchMedia).mockResolvedValue([createMediaItem({ mediaType: 'tv', id: 1396, title: 'Breaking Bad' })]);
    render(<SearchResultsGrid mediaType='tv' query='breaking' />);

    expect(await screen.findByText('Breaking Bad')).toBeInTheDocument();
    expect(searchMedia).toHaveBeenCalledWith('tv', 'breaking', 1, 'en');
  });
});
