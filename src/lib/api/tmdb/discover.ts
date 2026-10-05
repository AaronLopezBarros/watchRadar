import type { MovieCategory } from '@/lib/api/tmdb/types';

type DiscoverParams = Record<string, string | number>;

const DAY_MS = 24 * 60 * 60 * 1000;
const RELEASE_WINDOW_DAYS = 42;
// Without a vote floor, vote_average.desc is topped by obscure titles with a handful of perfect votes.
const TOP_RATED_MIN_VOTES = 300;
// Theatrical (limited) and theatrical releases, the same ones TMDB's own now_playing/upcoming lists use.
const THEATRICAL_RELEASE_TYPES = '2|3';

const toDateParam = (date: Date) => date.toISOString().slice(0, 10);

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * DAY_MS);

// /movie/{category} ignores with_genres, so a genre-filtered category is rebuilt as an equivalent
// /discover/movie query. Discover already sorts by popularity.desc by default.
export const getDiscoverParams = (category: MovieCategory, today: Date): DiscoverParams => {
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
