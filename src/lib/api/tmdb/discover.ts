import { MEDIA_CONFIG, type CategoryContext, type DiscoverParams } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaFilters, MediaType } from '@/lib/api/tmdb/types';

export const hasFilters = ({ genre, streaming }: MediaFilters) => Boolean(genre || streaming);

// /{mediaType}/{category} ignores with_genres and the watch filters, so a filtered category is rebuilt as an
// equivalent /discover query. TMDB ignores the monetization filter unless watch_region is set.
export const getDiscoverParams = <M extends MediaType>(
  mediaType: M,
  category: MediaCategory,
  filters: MediaFilters<M>,
  { today, region }: Omit<CategoryContext, 'streaming'>,
): DiscoverParams => {
  const config = MEDIA_CONFIG[mediaType];

  return {
    ...config.getCategoryParams(category, { today, region, streaming: Boolean(filters.streaming) }),
    with_genres: filters.genre && config.genreIds[filters.genre],
    ...(filters.streaming && { watch_region: region, with_watch_monetization_types: 'flatrate' }),
  };
};
