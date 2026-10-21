import type {
  Genre,
  MediaCategory,
  MediaGenre,
  MediaItem,
  MediaRef,
  MediaType,
  TmdbItemBase,
} from '@/lib/api/tmdb/types';

export type DiscoverParams = Record<string, string | number | undefined>;

type CategoryContext = {
  today: Date;
  streaming: boolean;
};

type MediaConfig<M extends MediaType> = {
  // Categories TMDB serves as `/{mediaType}/{category}`; the rest are always built as a /discover query.
  endpointCategories: readonly MediaCategory[];
  streamingCategories: readonly MediaCategory[];
  // In the order the filter picker lists them.
  genres: readonly MediaGenre<M>[];
  genreIds: Record<MediaGenre<M>, number>;
  // eslint-disable-next-line no-unused-vars -- the parameters name what each function takes, TS function types require a name
  getCategoryParams: (category: MediaCategory, context: CategoryContext) => DiscoverParams;
  // eslint-disable-next-line no-unused-vars -- the parameters name what each function takes, TS function types require a name
  normalize: (item: TmdbItemBase<M>, genres: Genre[]) => MediaItem;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const RELEASE_WINDOW_DAYS = 42;
// Movies reach subscription streaming one to three months after their premiere.
const STREAMING_RELEASE_WINDOW_DAYS = 90;
// Without a vote floor, vote_average.desc is topped by obscure titles with a handful of perfect votes.
// Series get far fewer votes than movies, so the same floor would leave out well-known ones.
const MOVIE_TOP_RATED_MIN_VOTES = 300;
const TV_TOP_RATED_MIN_VOTES = 200;
// TMDB's series popularity adds up activity across episodes, so a floor keeps out obscure long-running local shows.
const TV_POPULAR_MIN_VOTES = 100;
// Talk shows and news top the series lists every day; they're not what people browse series for.
const TV_EXCLUDED_GENRES = '10767,10763';
// TMDB release types: 2 = theatrical (limited), 3 = theatrical.
const THEATRICAL_RELEASE_TYPES = '2|3';

const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

// Discover already sorts by popularity.desc by default.
const getMovieCategoryParams = (category: MediaCategory, { today, streaming }: CategoryContext): DiscoverParams => {
  switch (category) {
    case 'popular':
      return {};
    case 'top_rated':
      return { sort_by: 'vote_average.desc', 'vote_count.gte': MOVIE_TOP_RATED_MIN_VOTES };
    case 'now_playing':
      // On streaming, "new" means a recent premiere that's already there. Matching any release date would bring in
      // old movies that just had a theatrical re-release somewhere, and those are on streaming by now.
      if (streaming) {
        return {
          'primary_release_date.gte': toDateParam(addDays(today, -STREAMING_RELEASE_WINDOW_DAYS)),
          'primary_release_date.lte': toDateParam(today),
        };
      }
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

const getTvCategoryCriteria = (category: MediaCategory, today: Date): DiscoverParams => {
  switch (category) {
    case 'popular':
      return { 'vote_count.gte': TV_POPULAR_MIN_VOTES };
    case 'top_rated':
      return { sort_by: 'vote_average.desc', 'vote_count.gte': TV_TOP_RATED_MIN_VOTES };
    case 'now_playing':
      return {
        'first_air_date.gte': toDateParam(addDays(today, -RELEASE_WINDOW_DAYS)),
        'first_air_date.lte': toDateParam(today),
      };
    case 'upcoming':
      return {
        'first_air_date.gte': toDateParam(addDays(today, 1)),
        'first_air_date.lte': toDateParam(addDays(today, RELEASE_WINDOW_DAYS)),
      };
  }
};

const getTvCategoryParams = (category: MediaCategory, { today }: CategoryContext): DiscoverParams => ({
  ...getTvCategoryCriteria(category, today),
  without_genres: TV_EXCLUDED_GENRES,
});

export const MEDIA_CATEGORIES: MediaCategory[] = ['popular', 'top_rated', 'upcoming', 'now_playing'];

// Nothing upcoming is on streaming yet.
const STREAMING_CATEGORIES: MediaCategory[] = ['popular', 'top_rated', 'now_playing'];

export const MEDIA_CONFIG: { [M in MediaType]: MediaConfig<M> } = {
  movie: {
    endpointCategories: MEDIA_CATEGORIES,
    streamingCategories: STREAMING_CATEGORIES,
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
  tv: {
    // Every series list goes through /discover so the talk shows and news can be left out.
    endpointCategories: [],
    streamingCategories: STREAMING_CATEGORIES,
    genres: [
      'action_adventure',
      'animation',
      'comedy',
      'crime',
      'documentary',
      'drama',
      'mystery',
      'reality',
      'science_fiction',
      'war_politics',
    ],
    genreIds: {
      action_adventure: 10759,
      animation: 16,
      comedy: 35,
      crime: 80,
      documentary: 99,
      drama: 18,
      mystery: 9648,
      reality: 10764,
      // TMDB's series genre is "Sci-Fi & Fantasy"; it shares the movie slug and label.
      science_fiction: 10765,
      war_politics: 10768,
    },
    getCategoryParams: getTvCategoryParams,
    normalize: (series, genres) => ({
      mediaType: 'tv',
      adult: series.adult,
      backdrop_path: series.backdrop_path,
      genres,
      id: series.id,
      original_language: series.original_language,
      original_title: series.original_name,
      overview: series.overview,
      popularity: series.popularity,
      poster_path: series.poster_path,
      release_date: series.first_air_date,
      title: series.name,
      vote_average: series.vote_average,
      vote_count: series.vote_count,
    }),
  },
};

export const MEDIA_TYPES = Object.keys(MEDIA_CONFIG) as MediaType[];

export const isMediaType = (value: unknown): value is MediaType => MEDIA_TYPES.some(mediaType => mediaType === value);

export const isMediaCategory = (value: unknown): value is MediaCategory =>
  MEDIA_CATEGORIES.some(category => category === value);

export const isMediaGenre = <M extends MediaType>(mediaType: M, value: unknown): value is MediaGenre<M> =>
  MEDIA_CONFIG[mediaType].genres.some(genre => genre === value);

export const hasCategoryEndpoint = (mediaType: MediaType, category: MediaCategory) =>
  MEDIA_CONFIG[mediaType].endpointCategories.some(endpointCategory => endpointCategory === category);

export const canFilterStreaming = (mediaType: MediaType, category: MediaCategory) =>
  MEDIA_CONFIG[mediaType].streamingCategories.some(streamingCategory => streamingCategory === category);

// TMDB ids are only unique within a media type, so anything that tells items apart needs both.
export const mediaKey = ({ mediaType, id }: MediaRef) => `${mediaType}-${id}`;
