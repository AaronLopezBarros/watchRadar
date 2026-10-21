import type { Genre, MediaItem, WatchProvider } from '@/lib/api/tmdb/types';

const defaultMediaItem: MediaItem = {
  mediaType: 'movie',
  id: 1,
  title: 'Test Movie',
  release_date: '2025-01-01',
  poster_path: '/test.jpg',
  adult: false,
  backdrop_path: null,
  genres: [],
  original_language: 'en',
  original_title: 'Test Movie',
  overview: '',
  popularity: 10,
  vote_average: 9,
  vote_count: 100,
};

export const createMediaItem = (overrides: Partial<MediaItem> = {}): MediaItem => {
  return {
    ...defaultMediaItem,
    ...overrides,
  };
};

export const createGenre = (overrides: Partial<Genre> = {}): Genre => ({
  id: 28,
  name: 'Action',
  ...overrides,
});

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
