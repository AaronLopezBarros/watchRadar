import { TMDB_WATCH_REGION } from '@/lib/api/tmdb/constants';
import { MEDIA_CONFIG, type DiscoverParams } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaFilters, MediaType } from '@/lib/api/tmdb/types';

export const hasFilters = ({ genre, streaming }: MediaFilters) => Boolean(genre || streaming);

// /{mediaType}/{category} ignores with_genres and the watch filters, so a filtered category is rebuilt as an
// equivalent /discover query. TMDB ignores the monetization filter unless watch_region is set.
export const getDiscoverParams = <M extends MediaType>(
  mediaType: M,
  category: MediaCategory,
  filters: MediaFilters<M>,
  today: Date,
): DiscoverParams => {
  const config = MEDIA_CONFIG[mediaType];

  return {
    ...config.getCategoryParams(category, { today, streaming: Boolean(filters.streaming) }),
    with_genres: filters.genre && config.genreIds[filters.genre],
    ...(filters.streaming && { watch_region: TMDB_WATCH_REGION, with_watch_monetization_types: 'flatrate' }),
  };
};
