const BASE_URL = 'https://api.themoviedb.org/';

type TmdbClientOptions = RequestInit & {
  revalidate?: number;
};

export async function tmdbClient<T>(endpoint: string, options?: TmdbClientOptions): Promise<T> {
  const { revalidate = 3600, headers = {}, ...restOptions } = options || {};

  const token = process.env.TMDB_TOKEN || process.env.TMDB_API_KEY;

  if (!token) {
    throw new Error('TMDB_TOKEN o TMDB_API_KEY is not set in the environment variables');
  }

  const url = `${BASE_URL}${endpoint}`;

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

    throw new Error(`TMDB API Error: ${errorMessage}`);
  }

  return response.json();
}
