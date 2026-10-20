import type {
  Genre,
  MediaCategory,
  MediaGenre,
  MediaItem,
  MediaType,
  MovieCategory,
  TmdbItemBase,
} from '@/lib/api/tmdb/types';

export type DiscoverParams = Record<string, string | number | undefined>;

type MediaConfig<M extends MediaType> = {
  categories: readonly MediaCategory<M>[];
  // Categories where the streaming filter makes sense.
  streamingCategories: readonly MediaCategory<M>[];
  // In the order the filter picker lists them.
  genres: readonly MediaGenre<M>[];
  genreIds: Record<MediaGenre<M>, number>;
  // Rebuilds a category as an equivalent /discover query, which is what the filters need.
  // eslint-disable-next-line no-unused-vars -- the parameters name what each function takes, TS function types require a name
  getCategoryParams: (category: MediaCategory<M>, today: Date) => DiscoverParams;
  // eslint-disable-next-line no-unused-vars -- the parameters name what each function takes, TS function types require a name
  normalize: (item: TmdbItemBase<M>, genres: Genre[]) => MediaItem;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RELEASE_WINDOW_DAYS = 42;
// Without a vote floor, vote_average.desc is topped by obscure titles with a handful of perfect votes.
const TOP_RATED_MIN_VOTES = 300;
// TMDB release types: 2 = theatrical (limited), 3 = theatrical.
const THEATRICAL_RELEASE_TYPES = '2|3';

const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

// Discover already sorts by popularity.desc by default.
const getMovieCategoryParams = (category: MovieCategory, today: Date): DiscoverParams => {
  switch (category) {
    case 'popular':
      return {};
    case 'top_rated':
      return { sort_by: 'vote_average.desc', 'vote_count.gte': TOP_RATED_MIN_VOTES };
    case 'now_playing':
      return {
        with_release_type: THEATRICAL_RELEASE_TYPES,
        'release_date.gte': toDateParam(addDays(today, -RELEASE_WINDOW_DAYS)),
        'release_date.lte': toDateParam(today),
      };
    case 'upcoming':
      return {
        with_release_type: THEATRICAL_RELEASE_TYPES,
        'release_date.gte': toDateParam(addDays(today, 1)),
        'release_date.lte': toDateParam(addDays(today, RELEASE_WINDOW_DAYS)),
      };
  }
};

export const MEDIA_CONFIG: { [M in MediaType]: MediaConfig<M> } = {
  movie: {
    categories: ['popular', 'top_rated', 'upcoming', 'now_playing'],
    // Cinema-based lists barely overlap with what's already on streaming, and TMDB counts regional re-releases
    // as theatrical, so combining them returns odd results (old blockbusters under "now playing").
    streamingCategories: ['popular', 'top_rated'],
    genres: [
      'action',
      'adventure',
      'animation',
      'comedy',
      'crime',
      'drama',
      'fantasy',
      'horror',
      'romance',
      'science_fiction',
      'thriller',
    ],
    genreIds: {
      action: 28,
      adventure: 12,
      animation: 16,
      comedy: 35,
      crime: 80,
      drama: 18,
      fantasy: 14,
      horror: 27,
      romance: 10749,
      science_fiction: 878,
      thriller: 53,
    },
    getCategoryParams: getMovieCategoryParams,
    normalize: (movie, genres) => ({
      mediaType: 'movie',
      adult: movie.adult,
      backdrop_path: movie.backdrop_path,
      genres,
      id: movie.id,
      original_language: movie.original_language,
      original_title: movie.original_title,
      overview: movie.overview,
      popularity: movie.popularity,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      title: movie.title,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
    }),
  },
};

const MEDIA_TYPES = Object.keys(MEDIA_CONFIG) as MediaType[];

export const isMediaType = (value: unknown): value is MediaType => MEDIA_TYPES.some(mediaType => mediaType === value);

export const isMediaCategory = <M extends MediaType>(mediaType: M, value: unknown): value is MediaCategory<M> =>
  MEDIA_CONFIG[mediaType].categories.some(category => category === value);

export const isMediaGenre = <M extends MediaType>(mediaType: M, value: unknown): value is MediaGenre<M> =>
  MEDIA_CONFIG[mediaType].genres.some(genre => genre === value);

// TMDB ids are only unique within a media type, so anything that tells items apart needs both.
export const mediaKey = ({ mediaType, id }: Pick<MediaItem, 'mediaType' | 'id'>) => `${mediaType}-${id}`;
