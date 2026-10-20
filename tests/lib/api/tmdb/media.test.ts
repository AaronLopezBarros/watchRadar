import { describe, expect, it } from 'vitest';

import { MEDIA_CONFIG, isMediaCategory, isMediaGenre, isMediaType, mediaKey } from '@/lib/api/tmdb/media';

describe('isMediaType', () => {
  it('accepts the supported media types', () => {
    expect(isMediaType('movie')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isMediaType('person')).toBe(false);
    expect(isMediaType(undefined)).toBe(false);
  });
});

describe('isMediaCategory', () => {
  it('accepts a category of the media type', () => {
    expect(isMediaCategory('movie', 'now_playing')).toBe(true);
  });

  it('rejects a category the media type does not have', () => {
    expect(isMediaCategory('movie', 'airing_today')).toBe(false);
    expect(isMediaCategory('movie', undefined)).toBe(false);
  });
});

describe('isMediaGenre', () => {
  it('accepts a genre of the media type', () => {
    expect(isMediaGenre('movie', 'horror')).toBe(true);
  });

  it('rejects a genre the media type does not have', () => {
    expect(isMediaGenre('movie', 'reality')).toBe(false);
  });
});

describe('mediaKey', () => {
  it('tells apart items of different media types that share an id', () => {
    expect(mediaKey({ mediaType: 'movie', id: 1399 })).toBe('movie-1399');
  });
});

describe('MEDIA_CONFIG.movie', () => {
  it('has a TMDB genre id for every genre it lists', () => {
    const { genres, genreIds } = MEDIA_CONFIG.movie;

    expect(Object.keys(genreIds).sort()).toEqual([...genres].sort());
  });

  it('only allows streaming in categories it has', () => {
    const { categories, streamingCategories } = MEDIA_CONFIG.movie;

    streamingCategories.forEach(category => expect(categories).toContain(category));
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
