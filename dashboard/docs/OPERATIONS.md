# Dashboard operations (Postgres + Next.js)

This app does **not** use Supabase Cloud, `@supabase/supabase-js`, or `VITE_SUPABASE_*` variables.

## Required environment

See `.env.example` in the dashboard root. Minimum:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection for Route Handlers (`pg`) |
| `AUTH_SECRET` | NextAuth signing secret |
| `NEXTAUTH_URL` | Public origin of this app (e.g. `http://localhost:3000`) |

## Schema

```bash
npm run db:apply-migrations
```

SQL files live in `postgres/migrations/`.

## Local dev

```bash
npm install
npm run dev
```

Optional API smoke (no cookies, public routes only):

```bash
npm run smoke:api
```

## Production process

```bash
npm run build
npm run start
```

## Docker

```bash
docker build -t vendor-dashboard .
docker run --rm -p 3000:3000 --env-file .env vendor-dashboard
```

Or `docker compose up --build` from this directory (expects a `.env` file next to `docker-compose.yml`).

## Public catalog URLs (for storefronts)

Replace `<host>` with your deployed dashboard origin (same host you set in `NEXTAUTH_URL`):

- `GET https://<host>/api/catalog/navigation`
- `GET https://<host>/api/catalog/taxonomy`
- `GET https://<host>/api/catalog/facets`

No Supabase anon key or `Authorization: Bearer` is required for these GET handlers unless you add that in code later.
