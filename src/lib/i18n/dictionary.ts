import type { MediaCategory, MediaGenre, MediaType } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export type Dictionary = {
  header: {
    tagline: string;
  };
  mediaType: Record<MediaType, string> & {
    groupAriaLabel: string;
  };
  category: Record<MediaCategory, string>;
  genre: Record<MediaGenre, string>;
  emptyList: Record<MediaType, string>;
  filters: {
    title: string;
    genres: string;
    allGenres: string;
    streaming: string;
    streamingOnly: string;
    clearAriaLabel: string;
    noResults: Record<MediaType, string>;
  };
  search: {
    openAriaLabel: Record<MediaType, string>;
    placeholder: Record<MediaType, string>;
    closeAriaLabel: string;
    error: string;
    retry: string;
    noResultsFor: string;
  };
  provider: {
    whereToWatch: string;
    notAvailable: string;
  };
  movie: {
    share: string;
    linkCopied: string;
    copyFailed: string;
  };
  language: {
    changeAriaLabel: string;
    groupAriaLabel: string;
  };
  error: {
    notFoundTitle: string;
    notFoundBody: string;
    serverTitle: string;
    serverBody: string;
    genericCode: string;
    genericTitle: string;
    goHome: string;
  };
  meta: {
    description: string;
  };
};

const translations: Record<Locale, Dictionary> = {
  en: {
    header: {
      tagline: 'Films · Series · Where to watch',
    },
    mediaType: {
      movie: 'Movies',
      tv: 'Series',
      groupAriaLabel: 'Content type',
    },
    category: {
      popular: 'Popular',
      top_rated: 'Top',
      upcoming: 'Upcoming',
      now_playing: 'New',
    },
    genre: {
      action: 'Action',
      action_adventure: 'Action & Adventure',
      adventure: 'Adventure',
      animation: 'Animation',
      comedy: 'Comedy',
      crime: 'Crime',
      documentary: 'Documentary',
      drama: 'Drama',
      fantasy: 'Fantasy',
      horror: 'Horror',
      mystery: 'Mystery',
      reality: 'Reality',
      romance: 'Romance',
      science_fiction: 'Science Fiction',
      thriller: 'Thriller',
      war_politics: 'War & Politics',
    },
    emptyList: {
      movie: 'No movies to show here.',
      tv: 'No series to show here.',
    },
    filters: {
      title: 'Filters',
      genres: 'Genres',
      allGenres: 'All',
      streaming: 'Streaming',
      streamingOnly: 'Streaming only',
      clearAriaLabel: 'Clear filters',
      noResults: {
        movie: 'No movies match these filters.',
        tv: 'No series match these filters.',
      },
    },
    search: {
      openAriaLabel: { movie: 'Search movies', tv: 'Search series' },
      placeholder: { movie: 'Search movies…', tv: 'Search series…' },
      closeAriaLabel: 'Close search',
      error: 'The search could not be completed.',
      retry: 'Retry',
      noResultsFor: 'No results found for',
    },
    provider: {
      whereToWatch: 'Where to watch',
      notAvailable: 'Not available for streaming',
    },
    movie: {
      share: 'Share',
      linkCopied: 'Link copied',
      copyFailed: "Couldn't copy the link",
    },
    language: {
      changeAriaLabel: 'Change language',
      groupAriaLabel: 'Language',
    },
    error: {
      notFoundTitle: 'Page not found',
      notFoundBody: "We couldn't find the page you were looking for.",
      serverTitle: 'Server error',
      serverBody: 'An unexpected error occurred. Please try again.',
      genericCode: 'Oops',
      genericTitle: 'Something went wrong',
      goHome: 'Go home',
    },
    meta: {
      description: 'Discover popular and top rated movies and series, and where to watch them.',
    },
  },
  es: {
    header: {
      tagline: 'Películas · Series · Dónde ver',
    },
    mediaType: {
      movie: 'Películas',
      tv: 'Series',
      groupAriaLabel: 'Tipo de contenido',
    },
    category: {
      popular: 'Populares',
      top_rated: 'Favoritas',
      upcoming: 'Próximas',
      now_playing: 'Nuevas',
    },
    genre: {
      action: 'Acción',
      action_adventure: 'Acción y aventura',
      adventure: 'Aventura',
      animation: 'Animación',
      comedy: 'Comedia',
      crime: 'Crimen',
      documentary: 'Documental',
      drama: 'Drama',
      fantasy: 'Fantasía',
      horror: 'Terror',
      mystery: 'Misterio',
      reality: 'Reality',
      romance: 'Romance',
      science_fiction: 'Ciencia ficción',
      thriller: 'Suspense',
      war_politics: 'Bélica y política',
    },
    emptyList: {
      movie: 'No hay películas que mostrar.',
      tv: 'No hay series que mostrar.',
    },
    filters: {
      title: 'Filtros',
      genres: 'Géneros',
      allGenres: 'Todos',
      streaming: 'Streaming',
      streamingOnly: 'Solo en streaming',
      clearAriaLabel: 'Quitar filtros',
      noResults: {
        movie: 'No hay películas con estos filtros.',
        tv: 'No hay series con estos filtros.',
      },
    },
    search: {
      openAriaLabel: { movie: 'Buscar películas', tv: 'Buscar series' },
      placeholder: { movie: 'Buscar películas…', tv: 'Buscar series…' },
      closeAriaLabel: 'Cerrar búsqueda',
      error: 'No se pudo completar la búsqueda.',
      retry: 'Reintentar',
      noResultsFor: 'No se encontraron resultados para',
    },
    provider: {
      whereToWatch: 'Dónde ver',
      notAvailable: 'No disponible en streaming',
    },
    movie: {
      share: 'Compartir',
      linkCopied: 'Enlace copiado',
      copyFailed: 'No se pudo copiar el enlace',
    },
    language: {
      changeAriaLabel: 'Cambiar idioma',
      groupAriaLabel: 'Idioma',
    },
    error: {
      notFoundTitle: 'Página no encontrada',
      notFoundBody: 'No pudimos encontrar la página que buscabas.',
      serverTitle: 'Error del servidor',
      serverBody: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
      genericCode: 'Ups',
      genericTitle: 'Algo salió mal',
      goHome: 'Ir al inicio',
    },
    meta: {
      description: 'Descubre películas y series populares y mejor valoradas, y dónde verlas.',
    },
  },
};

export const getDictionary = (locale: Locale): Dictionary => translations[locale];
