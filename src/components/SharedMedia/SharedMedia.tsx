import { fetchMediaDetails, fetchWatchProviders } from '@/lib/api/tmdb/actions';
import { getStreamingProviders } from '@/lib/api/tmdb/providers';
import type { Locale } from '@/lib/i18n/locale';
import { SharedMediaDialog } from '@/src/components/SharedMedia/SharedMediaDialog';

type SharedMediaProps = {
  movieId: number;
  locale: Locale;
};

export async function SharedMedia({ movieId, locale }: SharedMediaProps) {
  // Providers are fetched here rather than on mount so the dialog doesn't open on an empty "where to watch".
  const [item, providers] = await Promise.all([
    fetchMediaDetails('movie', movieId, locale).catch(() => null),
    fetchWatchProviders('movie', movieId)
      .then(getStreamingProviders)
      .catch(() => []),
  ]);

  // An unknown id (stale or hand-edited link) just lands on the home page.
  if (!item) return null;

  return <SharedMediaDialog item={item} providers={providers} />;
}
