import { fetchMovieDetails, fetchMovieWatchProviders } from '@/lib/api/tmdb/actions';
import { getStreamingProviders } from '@/lib/api/tmdb/providers';
import type { Locale } from '@/lib/i18n/locale';
import { SharedMovieDialog } from '@/src/components/SharedMovie/SharedMovieDialog';

type SharedMovieProps = {
  movieId: number;
  locale: Locale;
};

export async function SharedMovie({ movieId, locale }: SharedMovieProps) {
  // Providers are fetched here rather than on mount so the dialog doesn't open on an empty "where to watch".
  const [movie, providers] = await Promise.all([
    fetchMovieDetails(movieId, locale).catch(() => null),
    fetchMovieWatchProviders(movieId)
      .then(getStreamingProviders)
      .catch(() => []),
  ]);

  // An unknown id (stale or hand-edited link) just lands on the home page.
  if (!movie) return null;

  return <SharedMovieDialog movie={movie} providers={providers} />;
}
