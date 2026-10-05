import { TMDB_GENRE_ID, TMDB_WATCH_REGION } from '@/lib/api/tmdb/constants';
import type { MovieCategory, MovieFilters } from '@/lib/api/tmdb/types';

type DiscoverParams = Record<string, string | number | undefined>;

const DAY_MS = 24 * 60 * 60 * 1000;
const RELEASE_WINDOW_DAYS = 42;
// Without a vote floor, vote_average.desc is topped by obscure titles with a handful of perfect votes.
const TOP_RATED_MIN_VOTES = 300;
// TMDB release types: 2 = theatrical (limited), 3 = theatrical.
const THEATRICAL_RELEASE_TYPES = '2|3';

const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

// Discover already sorts by popularity.desc by default.
const getCategoryParams = (category: MovieCategory, today: Date): DiscoverParams => {
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

export const hasFilters = ({ genre, streaming }: MovieFilters) => Boolean(genre || streaming);

// /movie/{category} ignores with_genres and the watch filters, so a filtered category is rebuilt as an
// equivalent /discover/movie query. TMDB ignores the monetization filter unless watch_region is set.
export const getDiscoverParams = (category: MovieCategory, filters: MovieFilters, today: Date): DiscoverParams => ({
  ...getCategoryParams(category, today),
  with_genres: filters.genre && TMDB_GENRE_ID[filters.genre],
  ...(filters.streaming && { watch_region: TMDB_WATCH_REGION, with_watch_monetization_types: 'flatrate' }),
});
