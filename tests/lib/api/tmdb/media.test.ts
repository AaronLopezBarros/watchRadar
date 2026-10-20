import { describe, expect, it } from 'vitest';

import {
  MEDIA_CONFIG,
  canFilterStreaming,
  hasCategoryEndpoint,
  isMediaCategory,
  isMediaGenre,
  isMediaType,
  mediaKey,
} from '@/lib/api/tmdb/media';

describe('isMediaType', () => {
  it('accepts the supported media types', () => {
    expect(isMediaType('movie')).toBe(true);
    expect(isMediaType('tv')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isMediaType('person')).toBe(false);
    expect(isMediaType(undefined)).toBe(false);
  });
});

describe('isMediaCategory', () => {
  it('accepts the shared categories', () => {
    expect(isMediaCategory('now_playing')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isMediaCategory('trending')).toBe(false);
    expect(isMediaCategory(undefined)).toBe(false);
  });
});

describe('isMediaGenre', () => {
  it('accepts a genre of the media type', () => {
    expect(isMediaGenre('movie', 'horror')).toBe(true);
    expect(isMediaGenre('tv', 'reality')).toBe(true);
  });

  it('rejects a genre the media type does not have', () => {
    expect(isMediaGenre('movie', 'reality')).toBe(false);
    expect(isMediaGenre('tv', 'horror')).toBe(false);
  });
});

describe('mediaKey', () => {
  it('tells apart items of different media types that share an id', () => {
    expect(mediaKey({ mediaType: 'movie', id: 1399 })).not.toBe(mediaKey({ mediaType: 'tv', id: 1399 }));
  });
});

describe('hasCategoryEndpoint', () => {
  it('is true for the movie categories, which TMDB serves under their own endpoint', () => {
    expect(hasCategoryEndpoint('movie', 'now_playing')).toBe(true);
  });

  it('is false for every series category, which always goes through discover', () => {
    expect(hasCategoryEndpoint('tv', 'popular')).toBe(false);
    expect(hasCategoryEndpoint('tv', 'now_playing')).toBe(false);
  });
});

describe('canFilterStreaming', () => {
  it('allows streaming on everything already released', () => {
    expect(canFilterStreaming('movie', 'now_playing')).toBe(true);
    expect(canFilterStreaming('tv', 'popular')).toBe(true);
  });

  it('does not allow streaming on upcoming, which is not on streaming yet', () => {
    expect(canFilterStreaming('movie', 'upcoming')).toBe(false);
    expect(canFilterStreaming('tv', 'upcoming')).toBe(false);
  });
});

describe('MEDIA_CONFIG.movie', () => {
  it('has a TMDB genre id for every genre it lists', () => {
    const { genres, genreIds } = MEDIA_CONFIG.movie;

    expect(Object.keys(genreIds).sort()).toEqual([...genres].sort());
  });

  it('normalizes a TMDB movie into a media item with the given genres', () => {
    const genres = [{ id: 28, name: 'Action' }];

    expect(
      MEDIA_CONFIG.movie.normalize(
        {
          adult: false,
          backdrop_path: null,
          id: 27205,
          original_language: 'en',
          original_title: 'Inception',
          overview: 'A thief…',
          popularity: 80,
          poster_path: '/inception.jpg',
          release_date: '2010-07-15',
          title: 'Origen',
          vote_average: 8.4,
          vote_count: 35000,
        },
        genres,
      ),
    ).toEqual({
      mediaType: 'movie',
      adult: false,
      backdrop_path: null,
      genres,
      id: 27205,
      original_language: 'en',
      original_title: 'Inception',
      overview: 'A thief…',
      popularity: 80,
      poster_path: '/inception.jpg',
      release_date: '2010-07-15',
      title: 'Origen',
      vote_average: 8.4,
      vote_count: 35000,
    });
  });
});

describe('MEDIA_CONFIG.tv', () => {
  it('has a TMDB genre id for every genre it lists', () => {
    const { genres, genreIds } = MEDIA_CONFIG.tv;

    expect(Object.keys(genreIds).sort()).toEqual([...genres].sort());
  });

  it('normalizes a TMDB series into a media item with movie-like title and date fields', () => {
    const genres = [{ id: 18, name: 'Drama' }];

    expect(
      MEDIA_CONFIG.tv.normalize(
        {
          adult: false,
          backdrop_path: '/got-backdrop.jpg',
          first_air_date: '2011-04-17',
          id: 1399,
          name: 'Juego de tronos',
          original_language: 'en',
          original_name: 'Game of Thrones',
          overview: 'Siete casas nobles…',
          popularity: 300,
          poster_path: '/got.jpg',
          vote_average: 8.5,
          vote_count: 25000,
        },
        genres,
      ),
    ).toEqual({
      mediaType: 'tv',
      adult: false,
      backdrop_path: '/got-backdrop.jpg',
      genres,
      id: 1399,
      original_language: 'en',
      original_title: 'Game of Thrones',
      overview: 'Siete casas nobles…',
      popularity: 300,
      poster_path: '/got.jpg',
      release_date: '2011-04-17',
      title: 'Juego de tronos',
      vote_average: 8.5,
      vote_count: 25000,
    });
  });
});
