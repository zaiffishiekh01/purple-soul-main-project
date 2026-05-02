# Troubleshooting: create admin

The dashboard **does not** use Supabase Edge Functions or `@supabase/supabase-js`. Admin creation runs in-process:

- **HTTP:** `POST /api/functions/create-admin` (cookie session from NextAuth)
- **Code:** `app/api/functions/[name]/route.ts` — branch `create-admin`
- **Client:** `src/hooks/useAdminPermissions.ts` → `dashboardClient.functions.invoke('create-admin', { body: … })`

## Checklist

1. **Signed in** as a user who is a **super admin** in `admin_users` (the hook verifies this before calling the API).
2. **`DATABASE_URL`** points at the database where `auth.users` and `admin_users` exist; migrations applied (`npm run db:apply-migrations`).
3. **`AUTH_SECRET`** and **`NEXTAUTH_URL`** set for NextAuth (see `.env.example`).
4. **Server logs** on failed `POST` — Postgres errors (duplicate email, RLS, etc.) surface there.

## Quick checks

```bash
npm run smoke:api
```

Browser console (while on the dashboard, signed in):

```js
fetch('/api/auth/session', { credentials: 'include' }).then((r) => r.json()).then(console.log);
```

## Scripts

- `scripts/diagnose-create-admin.js` — verifies route file and `.env` hints.
- `scripts/test-create-admin-auth.js` — paste in DevTools to call `POST /api/functions/create-admin` with cookies.

For deployment and env vars, see **`docs/OPERATIONS.md`**.
