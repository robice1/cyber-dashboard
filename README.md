# Sentinel Security Dashboard

A local React and TypeScript vulnerability dashboard with sample data. It has no authentication, database, or external API connections.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` for a production build, `npm run lint` to run Oxlint, and `npm test` to run the CVSS and synthetic dataset unit tests.

## Run with Docker

Build and start the production container:

```sh
docker compose up --build -d
```

Open <http://127.0.0.1:8080>. The container runs as an unprivileged Nginx user, serves the Vite build with SPA fallback, and binds only to localhost. Stop it with `docker compose down`.

## Architecture

- `src/data/models.ts` defines repository, vulnerability, scanner, CWE, and CVSS contracts; `src/data/dashboardData.ts` generates a seeded 500-finding snapshot across 20 repositories without credential values.
- `src/data/analytics.ts` derives date-window subsets and 12-month trend series from findings.
- `src/App.tsx` composes the dashboard; KPIs, charts, and repository counts derive from the selected date range, while search and severity, status, scanner, and repository filters operate on dataset rows.
- `src/components/TrendChart.tsx` renders the trend chart with Recharts and is lazy-loaded so chart code does not block the main page bundle.
- `src/components/CvssCalculator.tsx` calculates CVSS 3.1 base scores from the eight base metrics using `@pandatix/js-cvss`.
- `src/lib/cvss31.ts` builds vectors and returns standard scores and ratings; `tests/cvss31.test.ts` covers known vectors and score changes.
- `src/App.css` and `src/index.css` hold the dashboard layout, theme, and responsive styles.

Replace `mockDashboardData` with a loader returning `DashboardSnapshot` when a data source is introduced; no API client is included yet. The seeded generator can take a fixed timestamp and seed for reproducible test fixtures.
