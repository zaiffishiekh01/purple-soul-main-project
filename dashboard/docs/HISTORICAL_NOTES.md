# Historical documentation

Some markdown files under the dashboard root (for example `URGENT_NEXT_STEPS.md`, `ROOT_CAUSE_AND_FIX.md`, `CREATE_ADMIN_401_FIX.md`, `BEFORE_AFTER_CODE_CHANGES.md`) still contain **verbatim excerpts** from an older Supabase Edge + `@supabase/supabase-js` architecture.

They are kept as **audit / context** only. For **current** behavior, env vars, and URLs, use:

- **`docs/OPERATIONS.md`**
- **`README.md`**
- **`TROUBLESHOOT_CREATE_ADMIN.md`** (admin creation)
- **`PUBLIC_API_ENDPOINTS.md`** (public catalog APIs)

The runtime stack is **Next.js Route Handlers**, **Postgres** (`DATABASE_URL`), and **NextAuth**.
