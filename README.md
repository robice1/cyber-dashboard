# Sentinel Security Dashboard

A local React and TypeScript vulnerability dashboard with sample data. It has no authentication, database, or external API connections.

## Run locally

```sh
npm install
npm run dev
```

Use `npm run build` for a production build, `npm run lint` to run Oxlint, and `npm test` to run the CVSS unit tests.

## Architecture

- `src/data/mockData.ts` contains the typed repository, vulnerability, and trend fixtures.
- `src/App.tsx` composes the dashboard and owns the search, severity, status, and repository filters. Summary counts are derived from the same fixtures.
- `src/components/TrendChart.tsx` renders the trend chart with Recharts and is lazy-loaded so chart code does not block the main page bundle.
- `src/components/CvssCalculator.tsx` calculates CVSS 3.1 base scores from the eight base metrics using `@pandatix/js-cvss`.
- `src/lib/cvss31.ts` builds vectors and returns standard scores and ratings; `tests/cvss31.test.ts` covers known vectors and score changes.
- `src/App.css` and `src/index.css` hold the dashboard layout, theme, and responsive styles.

Replace the fixture arrays with a service layer when a data source is introduced; the dashboard currently runs entirely in the browser.
