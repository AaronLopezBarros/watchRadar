import { MEDIA_TYPES, canFilterStreaming, isMediaCategory, isMediaGenre, isMediaType } from '@/lib/api/tmdb/media';
import type { MediaCategory, MediaFilters, MediaRef, MediaType } from '@/lib/api/tmdb/types';
import { isLocale, type Locale } from '@/lib/i18n/locale';

// Without `type` the home shows movies, so links shared before series existed keep working.
const DEFAULT_MEDIA_TYPE: MediaType = 'movie';
const DEFAULT_CATEGORY: MediaCategory = 'popular';
const STREAMING_ON = '1';

type HomeHrefOptions = MediaFilters & {
  mediaType?: MediaType;
  category: MediaCategory;
};

// The open item's id goes in a param named after its type (`?movie=27205`, `?tv=1399`): ids repeat across types,
// so a bare `?id=` couldn't tell a series from the movie with the same id. A media type must therefore never be
// named like another home param below.
export type HomeSearchParams = Partial<Record<MediaType, string>> & {
  type?: string;
  category?: string;
  genre?: string;
  streaming?: string;
  lang?: string;
};

// The id ends up in a TMDB path (`/movie/{id}`, `/tv/{id}`) sent with our token, so anything but a plain id must
// not get through.
const parseMediaId = (value: string | undefined): number | undefined =>
  value && /^[1-9]\d*$/.test(value) ? Number(value) : undefined;

export const buildHomeHref = ({
  mediaType = DEFAULT_MEDIA_TYPE,
  category,
  genre,
  streaming,
}: HomeHrefOptions): string => {
  const searchParams = new URLSearchParams();

  if (mediaType !== DEFAULT_MEDIA_TYPE) searchParams.set('type', mediaType);
  if (category !== DEFAULT_CATEGORY) searchParams.set('category', category);
  if (genre) searchParams.set('genre', genre);
  if (streaming && canFilterStreaming(mediaType, category)) searchParams.set('streaming', STREAMING_ON);

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};

export const withMediaParam = (search: string, item?: MediaRef): string => {
  const searchParams = new URLSearchParams(search);

  MEDIA_TYPES.forEach(mediaType => searchParams.delete(mediaType));

  if (item) {
    searchParams.set(item.mediaType, String(item.id));
  } else {
    // The sharer's language only matters for the shared item's link preview, so it goes along with the item.
    searchParams.delete('lang');
  }

  return searchParams.size ? `/?${searchParams.toString()}` : '/';
};

// The sender's category and filters stay out: the recipient only cares about the item. Its type goes in so the
// item opens over its own grid, and the sender's language for the link preview.
export const buildShareHref = ({ mediaType, id }: MediaRef, locale: Locale): string => {
  const searchParams = new URLSearchParams();

  if (mediaType !== DEFAULT_MEDIA_TYPE) searchParams.set('type', mediaType);
  searchParams.set(mediaType, String(id));
  searchParams.set('lang', locale);

  return `/?${searchParams.toString()}`;
};

export const parseHomeSearchParams = (
  params: HomeSearchParams,
): {
  mediaType: MediaType;
  category: MediaCategory;
  filters: MediaFilters;
  sharedMedia?: MediaRef;
  sharedLocale?: Locale;
} => {
  const mediaType = isMediaType(params.type) ? params.type : DEFAULT_MEDIA_TYPE;
  const category = isMediaCategory(params.category) ? params.category : DEFAULT_CATEGORY;
  // Only the page's own type is read, so `?type=tv&movie=1` opens nothing rather than a movie over the series grid.
  const sharedId = parseMediaId(params[mediaType]);

  return {
    mediaType,
    category,
    filters: {
      genre: isMediaGenre(mediaType, params.genre) ? params.genre : undefined,
      streaming: params.streaming === STREAMING_ON && canFilterStreaming(mediaType, category),
    },
    sharedMedia: sharedId ? { mediaType, id: sharedId } : undefined,
    sharedLocale: isLocale(params.lang) ? params.lang : undefined,
  };
};
