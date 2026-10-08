export type MovieCategory = 'popular' | 'top_rated' | 'upcoming' | 'now_playing';

export type MovieGenre =
  | 'action'
  | 'adventure'
  | 'animation'
  | 'comedy'
  | 'crime'
  | 'drama'
  | 'fantasy'
  | 'horror'
  | 'romance'
  | 'science_fiction'
  | 'thriller';

export type MovieFilters = {
  genre?: MovieGenre;
  streaming?: boolean;
};

// Shape of a movie in TMDB list endpoints, which only carry genre ids.
export type TmdbMovie = {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  vote_average: number;
  vote_count: number;
};

export type Genre = {
  id: number;
  name: string;
};

export type GenresResponse = {
  genres: Genre[];
};

// Same shape as TMDB's movie details; list results get their genre names filled in on the server.
export type Movie = Omit<TmdbMovie, 'genre_ids'> & {
  genres: Genre[];
};

export type MoviesResponse = {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
};

export type WatchProvider = {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
};

export type WatchProvidersCountryResult = {
  link: string;
  flatrate?: WatchProvider[];
};

export type WatchProvidersResponse = {
  id: number;
  results: Record<string, WatchProvidersCountryResult>;
};
