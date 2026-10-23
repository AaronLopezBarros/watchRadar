import { SharedMediaDialog } from '@/components/SharedMedia/SharedMediaDialog';
import { fetchMediaDetails, fetchStreamingProviders } from '@/lib/api/tmdb/actions';
import type { MediaRef } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

type SharedMediaProps = {
  sharedMedia: MediaRef;
  locale: Locale;
};

export async function SharedMedia({ sharedMedia: { mediaType, id }, locale }: SharedMediaProps) {
  // Providers are fetched here rather than on mount so the dialog doesn't open on an empty "where to watch".
  const [item, providers] = await Promise.all([
    fetchMediaDetails(mediaType, id, locale).catch(() => null),
    fetchStreamingProviders(mediaType, id).catch(() => []),
  ]);

  if (!item) return null;

  return <SharedMediaDialog item={item} providers={providers} />;
}
