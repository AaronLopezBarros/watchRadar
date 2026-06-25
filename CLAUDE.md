# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev              # start dev server
pnpm build            # production build
pnpm lint             # ESLint
pnpm test             # run tests (watch mode)
pnpm test:coverage    # run tests with coverage report
```

Run a single test file:
```bash
pnpm vitest run tests/lib/utils/array.test.ts
```

## Environment

Requires either `TMDB_TOKEN` (preferred, Bearer token) or `TMDB_API_KEY` in `.env`. The client in `src/lib/api/tmdb/client.ts` checks both and throws if neither is set.

## Architecture

**Data flow:** Next.js App Router RSC pages → server components fetch TMDB data → pass to client components for interactivity.

- `src/lib/api/tmdb/client.ts` — thin fetch wrapper for TMDB API v3. Handles auth, query params, and Next.js `revalidate` (default 1 hour). All TMDB calls go through `tmdbClient<T>()`.
- `src/lib/api/tmdb/movies.ts` — service layer on top of the client. `getPopularMoviesMultiplePages()` fans out parallel requests and deduplicates results by `id`.
- `src/components/PopularMovies.tsx` — async RSC; fetches 10 pages of popular movies and renders the grid.
- `src/components/MovieCard/` — split into `MovieCard.tsx` (client component, hover/flip logic) and `ImageCard.tsx`. `MovieCard` calculates whether the expanded panel would overflow the viewport and flips direction accordingly.

**Path aliases** (defined in both `tsconfig.json` and `vitest.config.ts`):
- `@/src/*` → `src/*`
- `@/lib/*` → `src/lib/*`
- `@/components/*` → `src/components/*`
- `@/tests/*` → `tests/*`

**Testing:** Vitest + jsdom + Testing Library. Tests live in `tests/` mirroring `src/`. Factories are in `tests/factories/`. Coverage excludes `src/app/` (route files).
