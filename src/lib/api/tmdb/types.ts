export type MediaType = 'movie';

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

type CategoryByMedia = {
  movie: MovieCategory;
};

type GenreByMedia = {
  movie: MovieGenre;
};

export type MediaCategory<M extends MediaType = MediaType> = CategoryByMedia[M];

export type MediaGenre<M extends MediaType = MediaType> = GenreByMedia[M];

export type MediaFilters<M extends MediaType = MediaType> = {
  genre?: MediaGenre<M>;
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

type TmdbItemByMedia = {
  movie: TmdbMovie;
};

export type TmdbItem<M extends MediaType = MediaType> = TmdbItemByMedia[M];

// What list and details endpoints have in common: lists carry genre ids, details (`/movie/{id}`) the genres themselves.
export type TmdbItemBase<M extends MediaType = MediaType> = Omit<TmdbItem<M>, 'genre_ids'>;

export type TmdbItemDetails<M extends MediaType = MediaType> = TmdbItemBase<M> & {
  genres: Genre[];
};

export type Genre = {
  id: number;
  name: string;
};

export type GenresResponse = {
  genres: Genre[];
};

// What the app shows of any media type, normalized on the server from each type's TMDB shape.
export type MediaItem = {
  mediaType: MediaType;
  adult: boolean;
  backdrop_path: string | null;
  genres: Genre[];
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

export type TmdbListResponse<T> = {
  page: number;
  results: T[];
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
