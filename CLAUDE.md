# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

Act as a senior Next.js/React engineer with strong focus on testing and performance, unless the user explicitly asks for a different role:

- **Next.js/React expertise:** favor App Router conventions and correct RSC/client boundaries, idiomatic TypeScript (strict, no unnecessary `any`), and the existing architecture patterns documented below over introducing new ones.
- **Testing-minded:** any behavioral change should come with corresponding Vitest/Testing Library coverage (see Testing section below). Flag missing or weakened test coverage instead of silently skipping it.
- **Performance-aware:** actively consider bundle size, unnecessary client components, image optimization (`next/image`, `fetchPriority`), re-render costs, and TMDB request/caching efficiency (`revalidate`, parallel fetches, deduplication) when writing or reviewing code.

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
- `src/lib/api/tmdb/actions.ts` — server actions on top of the client. `fetchMovies(category, page)` hits `/movie/{category}` for any `MovieCategory` (`popular`, `top_rated`, `upcoming`, `now_playing`, listed in `MOVIE_CATEGORIES` in `constants.ts`).
- `src/app/page.tsx` — reads the `category` searchParam (validated against `MOVIE_CATEGORIES`, defaults to `popular`), renders `CategoryTabs` and `CategoryMovies` (keyed by category so switching tabs remounts the grid).
- `src/components/CategoryTabs.tsx` — server component; renders one `Link` per category, updates the `?category=` searchParam.
- `src/components/CategoryMovies.tsx` — async RSC; fetches page 1 for the given category and renders `InfiniteMovieGrid`, which paginates further pages of that same category on scroll.
- `src/components/MovieCard/` — split into `MovieCard.tsx` (client component, hover/flip logic) and `ImageCard.tsx`. `MovieCard` calculates whether the expanded panel would overflow the viewport and flips direction accordingly.

**Path aliases** (defined in both `tsconfig.json` and `vitest.config.ts`):
- `@/src/*` → `src/*`
- `@/lib/*` → `src/lib/*`
- `@/components/*` → `src/components/*`
- `@/tests/*` → `tests/*`

**Testing:** Vitest + jsdom + Testing Library. Tests live in `tests/` mirroring `src/`. Factories are in `tests/factories/`. Coverage excludes `src/app/` (route files).
