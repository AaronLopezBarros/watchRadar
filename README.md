# WatchRadar

A Next.js (App Router) app for discovering movies using the TMDB API: category browsing, infinite scroll, search, per-title streaming provider availability, and multi-language support (English/Spanish).

## Requirements

- Node.js and [pnpm](https://pnpm.io/)
- A [TMDB](https://www.themoviedb.org/documentation/api) API key: `TMDB_TOKEN` (Bearer token, preferred) or `TMDB_API_KEY`

## Getting started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file at the project root with one of these variables:

   ```bash
   TMDB_TOKEN=your_bearer_token
   # or
   TMDB_API_KEY=your_api_key
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000).

## Commands

| Command              | Description                           |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | Starts the development server         |
| `pnpm build`         | Creates the production build          |
| `pnpm start`         | Serves the production build           |
| `pnpm lint`          | Runs ESLint                           |
| `pnpm test`          | Runs the tests (watch mode)           |
| `pnpm test:coverage` | Runs the tests with a coverage report |

To run a single test file:

```bash
pnpm vitest run tests/lib/utils/getPosterUrl.test.ts
```

## Architecture

**Data flow:** App Router RSC pages fetch TMDB data on the server and pass it to client components for interactivity.

| File | Role |
| --- | --- |
| `src/lib/api/tmdb/client.ts` | Thin `fetch` wrapper for TMDB API v3: auth, query params, `revalidate` (default 1h). All TMDB calls go through `tmdbClient<T>()`. |
| `src/lib/api/tmdb/actions.ts` | Server actions. `fetchMovies(category, page)` → `/movie/{category}` for any `MovieCategory` (see `MOVIE_CATEGORIES` in `constants.ts`). |
| `src/app/page.tsx` | Reads searchParam `category` (validated against `MOVIE_CATEGORIES`, defaults to `popular`). Renders `CategoryTabs` + `CategoryMovies`, keyed by category/locale so switching remounts the grid. |
| `src/components/CategoryTabs.tsx` | Server component. One `Link` per category, updates `?category=`. |
| `src/components/CategoryMovies.tsx` | Async RSC. Fetches page 1 and renders `InfiniteMovieGrid` (paginates further pages on scroll). |
| `src/components/MovieCard/` | `MovieCard.tsx` (client, hover/flip; calculates whether the expanded panel would overflow the viewport and flips direction) + `ImageCard.tsx`. |
| `src/components/SearchBar/` | Movie search: `SearchProvider` (context) + `SearchGridSwitch`, which toggles between the per-category grid and the search results grid. |
| `src/lib/i18n/` | Language support (`en`/`es`) backed by a cookie (`LOCALE_COOKIE_NAME`), with a translation dictionary and a mapping to TMDB's language codes (`TMDB_LANGUAGE`). |

### Path aliases

Defined in both `tsconfig.json` and `vitest.config.ts`:

| Alias | Points to |
| --- | --- |
| `@/src/*` | `src/*` |
| `@/lib/*` | `src/lib/*` |
| `@/components/*` | `src/components/*` |
| `@/tests/*` | `tests/*` |

## Testing

Vitest + jsdom + Testing Library. Tests live in `tests/`, mirroring the `src/` structure. Factories are in `tests/factories/`. Coverage excludes `src/app/` (route files).

## Deployed on Vercel

WatchRadar is deployed on Vercel: [watchRadar](https://watch-radar-pi.vercel.app)
