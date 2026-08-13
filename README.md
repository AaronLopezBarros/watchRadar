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

**Data flow:** App Router RSC pages fetch TMDB data on the server through server actions, and pass it down to client components for interactivity (infinite scroll, search, the movie detail dialog, locale switching).

| Folder | Contains |
| --- | --- |
| `src/app/` | Routes, root layout and metadata. |
| `src/components/` | UI, grouped by feature: category tabs/grid, movie card/dialog, infinite scroll grid, search, language selector, header. |
| `src/lib/api/tmdb/` | TMDB API client, server actions and types. |
| `src/lib/i18n/` | Locale detection/switching (cookie-based) and the translation dictionary. |
| `src/lib/hooks/` | Shared client hooks. |
| `src/lib/utils/` | Small utility helpers. |

### Path aliases

Defined in both `tsconfig.json` and `vitest.config.ts`:

| Alias | Points to |
| --- | --- |
| `@/src/*` | `src/*` |
| `@/app/*` | `src/app/*` |
| `@/lib/*` | `src/lib/*` |
| `@/components/*` | `src/components/*` |
| `@/tests/*` | `tests/*` |

## Testing

Vitest + jsdom + Testing Library. Tests live in `tests/`, mirroring the `src/` structure. Factories are in `tests/factories/`. Coverage excludes `src/app/` (route files).

## Deployed on Vercel

WatchRadar is deployed on Vercel: [watchRadar](https://watch-radar-pi.vercel.app)
