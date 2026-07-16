import type { MovieCategory } from '@/lib/api/tmdb/types';
import type { Locale } from '@/lib/i18n/locale';

export type Dictionary = {
  header: {
    tagline: string;
  };
  category: Record<MovieCategory, string>;
  search: {
    openAriaLabel: string;
    placeholder: string;
    closeAriaLabel: string;
    error: string;
    retry: string;
    noResultsFor: string;
  };
  provider: {
    whereToWatch: string;
    notAvailable: string;
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
      tagline: 'Films · Ratings · Where to watch',
    },
    category: {
      popular: 'Popular',
      top_rated: 'Top Rated',
      upcoming: 'Upcoming',
      now_playing: 'Now Playing',
    },
    search: {
      openAriaLabel: 'Search movies',
      placeholder: 'Search movies…',
      closeAriaLabel: 'Close search',
      error: 'The search could not be completed.',
      retry: 'Retry',
      noResultsFor: 'No results found for',
    },
    provider: {
      whereToWatch: 'Where to watch',
      notAvailable: 'Not available for streaming',
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
      description: 'Discover popular, top rated, upcoming and now playing movies.',
    },
  },
  es: {
    header: {
      tagline: 'Películas · Valoraciones · Dónde ver',
    },
    category: {
      popular: 'Populares',
      top_rated: 'Mejor valoradas',
      upcoming: 'Próximamente',
      now_playing: 'En cartelera',
    },
    search: {
      openAriaLabel: 'Buscar películas',
      placeholder: 'Buscar películas…',
      closeAriaLabel: 'Cerrar búsqueda',
      error: 'No se pudo completar la búsqueda.',
      retry: 'Reintentar',
      noResultsFor: 'No se encontraron resultados para',
    },
    provider: {
      whereToWatch: 'Dónde ver',
      notAvailable: 'No disponible en streaming',
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
      description: 'Descubre películas populares, mejor valoradas, próximas y en cartelera.',
    },
  },
};

export const getDictionary = (locale: Locale): Dictionary => translations[locale];
