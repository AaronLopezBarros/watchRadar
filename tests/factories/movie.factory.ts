import { Movie, WatchProvider } from '@/src/lib/api/tmdb/types';

const defaultMovie: Movie = {
  id: 1,
  title: 'Test Movie',
  release_date: '2025-01-01',
  poster_path: '/test.jpg',
  adult: false,
  backdrop_path: null,
  genre_ids: [],
  original_language: 'en',
  original_title: 'Test Movie',
  overview: '',
  popularity: 10,
  vote_average: 9,
  vote_count: 100,
};

export const createMovie = (overrides: Partial<Movie> = {}): Movie => {
  return {
    ...defaultMovie,
    ...overrides,
  };
};

const defaultProvider: WatchProvider = {
  provider_id: 1,
  provider_name: 'Netflix',
  logo_path: '/netflix.png',
  display_priority: 1,
};

export const createProvider = (overrides: Partial<WatchProvider> = {}): WatchProvider => ({
  ...defaultProvider,
  ...overrides,
});
