import { fetchMediaDetails, fetchWatchProviders } from '@/lib/api/tmdb/actions';
import { getStreamingProviders } from '@/lib/api/tmdb/providers';
import type { MediaRef } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';
import { SharedMediaDialog } from '@/src/components/SharedMedia/SharedMediaDialog';

type SharedMediaProps = {
  sharedMedia: MediaRef;
  locale: Locale;
};

export async function SharedMedia({ sharedMedia: { mediaType, id }, locale }: SharedMediaProps) {
  // Providers are fetched here rather than on mount so the dialog doesn't open on an empty "where to watch".
  const [item, providers] = await Promise.all([
    fetchMediaDetails(mediaType, id, locale).catch(() => null),
    fetchWatchProviders(mediaType, id)
      .then(getStreamingProviders)
      .catch(() => []),
  ]);

  if (!item) return null;

  return <SharedMediaDialog item={item} providers={providers} />;
}
