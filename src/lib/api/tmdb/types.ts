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

export type Movie = {
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

export type MovieDetails = Omit<Movie, 'genre_ids'>;

export type MoviesResponse = {
  page: number;
  results: Movie[];
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
