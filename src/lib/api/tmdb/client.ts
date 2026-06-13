const BASE_URL = 'https://api.themoviedb.org/3';

type QueryParams = Record<string, string | number | boolean | undefined | null>;

type TmdbClientOptions = RequestInit & {
  revalidate?: number;
  params?: QueryParams;
};

export const tmdbClient = async <T>(endpoint: string, options?: TmdbClientOptions): Promise<T> => {
  const { params, revalidate = 3600, headers = {}, ...restOptions } = options || {};

  const token = process.env.TMDB_TOKEN || process.env.TMDB_API_KEY;

  if (!token) {
    throw new Error('TMDB_TOKEN o TMDB_API_KEY is not set in the environment variables');
  }

  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const url = `${BASE_URL}${endpoint}` + (searchParams.size ? `?${searchParams.toString()}` : '');

  const response = await fetch(url, {
    ...restOptions,
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
      ...headers,
    },
    next: { revalidate },
  });

  if (!response.ok) {
    const errorMessage = `Error ${response.status}: ${response.statusText}`;

    throw new Error(`TMDB API Error ${endpoint}: ${errorMessage}`);
  }

  return response.json();
};
