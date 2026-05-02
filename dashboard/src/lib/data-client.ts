/**
 * Browser-side data access for the dashboard.
 * Talks to Next.js Route Handlers (/api/db/*, /api/storage/*, /api/functions/*) which use `pg` against Postgres.
 * Session is cookie-based (NextAuth); use `credentials: 'include'` on all requests.
 */

import { dedupeInFlight } from './in-flight-dedupe';

type AuthEvent = 'SIGNED_IN' | 'SIGNED_OUT' | 'USER_UPDATED' | 'TOKEN_REFRESHED';

interface DbResult<T = unknown> {
  data: T;
  error: { message: string } | null;
  count?: number | null;
}

function isSelectQueryPayload(body: string): boolean {
  try {
    const o = JSON.parse(body) as { action?: string };
    return o.action === 'select';
  } catch {
    return false;
  }
}

async function performFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type') && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'include',
  });
  const json = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    const msg =
      typeof json === 'object' && json !== null && 'error' in json && typeof (json as { error?: string }).error === 'string'
        ? (json as { error: string }).error
        : `Request failed: ${response.status}`;
    throw new Error(msg);
  }
  return json as T;
}

/** Idempotent read coalescing for identical POST /api/db/query select bodies (many hooks mount together). */
async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method === 'POST' && path === '/api/db/query' && typeof init.body === 'string' && isSelectQueryPayload(init.body)) {
    const key = `POST:/api/db/query:${init.body}`;
    return dedupeInFlight(key, () => performFetch<T>(path, init));
  }
  return performFetch<T>(path, init);
}

class QueryBuilder<T = unknown> implements PromiseLike<DbResult<T[]>> {
  private readonly table: string;
  private action: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select';
  private selectClause = '*';
  private filters: Array<{ column: string; op: string; value: unknown }> = [];
  private orderBy: Array<{ column: string; ascending: boolean }> = [];
  private limitValue?: number;
  private offsetValue?: number;
  private payload?: Record<string, unknown> | Record<string, unknown>[];
  private singleResult = false;
  private maybeSingleResult = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*', _options?: Record<string, unknown>) {
    this.action = 'select';
    this.selectClause = columns;
    return this;
  }

  insert(values: Record<string, unknown> | Record<string, unknown>[], _options?: Record<string, unknown>) {
    this.action = 'insert';
    this.payload = values;
    return this;
  }

  update(values: Record<string, unknown>) {
    this.action = 'update';
    this.payload = values;
    return this;
  }

  upsert(values: Record<string, unknown> | Record<string, unknown>[], _options?: Record<string, unknown>) {
    this.action = 'upsert';
    this.payload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column: string, value: unknown) {
    this.filters.push({ column, op: 'neq', value });
    return this;
  }

  gt(column: string, value: unknown) {
    this.filters.push({ column, op: 'gt', value });
    return this;
  }

  gte(column: string, value: unknown) {
    this.filters.push({ column, op: 'gte', value });
    return this;
  }

  lt(column: string, value: unknown) {
    this.filters.push({ column, op: 'lt', value });
    return this;
  }

  lte(column: string, value: unknown) {
    this.filters.push({ column, op: 'lte', value });
    return this;
  }

  like(column: string, value: unknown) {
    this.filters.push({ column, op: 'like', value });
    return this;
  }

  ilike(column: string, value: unknown) {
    this.filters.push({ column, op: 'ilike', value });
    return this;
  }

  in(column: string, value: unknown[]) {
    this.filters.push({ column, op: 'in', value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ column, op: 'is', value });
    return this;
  }

  or(_expr: string) {
    return this;
  }

  not(_column: string, _operator: string, _value: unknown) {
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderBy.push({ column, ascending: options?.ascending !== false });
    return this;
  }

  limit(value: number) {
    this.limitValue = value;
    return this;
  }

  range(from: number, to: number) {
    this.offsetValue = from;
    this.limitValue = to - from + 1;
    return this;
  }

  single(): Promise<DbResult<T>> {
    this.singleResult = true;
    return this.executeOne();
  }

  maybeSingle(): Promise<DbResult<T | null>> {
    this.maybeSingleResult = true;
    return this.executeMaybeOne();
  }

  async execute(): Promise<DbResult<T[]>> {
    return apiFetch<DbResult<T[]>>(`/api/db/query`, {
      method: 'POST',
      body: JSON.stringify({
        table: this.table,
        action: this.action,
        select: this.selectClause,
        filters: this.filters,
        orderBy: this.orderBy,
        limit: this.limitValue,
        offset: this.offsetValue,
        payload: this.payload,
      }),
    });
  }

  async executeOne(): Promise<DbResult<T>> {
    return apiFetch<DbResult<T>>(`/api/db/query`, {
      method: 'POST',
      body: JSON.stringify({
        table: this.table,
        action: this.action,
        select: this.selectClause,
        filters: this.filters,
        orderBy: this.orderBy,
        limit: this.limitValue,
        offset: this.offsetValue,
        payload: this.payload,
        single: true,
      }),
    });
  }

  async executeMaybeOne(): Promise<DbResult<T | null>> {
    return apiFetch<DbResult<T | null>>(`/api/db/query`, {
      method: 'POST',
      body: JSON.stringify({
        table: this.table,
        action: this.action,
        select: this.selectClause,
        filters: this.filters,
        orderBy: this.orderBy,
        limit: this.limitValue,
        offset: this.offsetValue,
        payload: this.payload,
        maybeSingle: true,
      }),
    });
  }

  then<TResult1 = DbResult<T[]>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<T[]>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

const listeners = new Set<(event: AuthEvent, session: { user: { id: string; email: string } } | null) => void>();

function emit(event: AuthEvent, user: { id: string; email: string } | null) {
  const session = user ? { user } : null;
  listeners.forEach((listener) => listener(event, session));
}

type NextAuthSessionJson = {
  user?: { id?: string; email?: string; name?: string | null; image?: string | null } | null;
  expires?: string;
};

function parseNextAuthSession(json: NextAuthSessionJson | null): {
  user: { id: string; email: string } | null;
} {
  const u = json?.user;
  if (!u?.id || !u.email) {
    return { user: null };
  }
  return { user: { id: u.id, email: u.email } };
}

async function fetchAuthSession(): Promise<NextAuthSessionJson | null> {
  const response = await fetch(`/api/auth/session`, { credentials: 'include' });
  const text = await response.text();
  if (!text || text === 'null') {
    return null;
  }
  try {
    return JSON.parse(text) as NextAuthSessionJson;
  } catch {
    return null;
  }
}

export const dashboardClient = {
  auth: {
    async getSession() {
      const json = await fetchAuthSession();
      const { user } = parseNextAuthSession(json);
      return {
        data: {
          session: user
            ? {
                user,
                access_token: null as string | null,
                refresh_token: null as string | null,
              }
            : null,
        },
        error: null,
      };
    },

    async getUser() {
      const { data } = await dashboardClient.auth.getSession();
      return { data: { user: data.session?.user ?? null }, error: null };
    },

    /**
     * Prefer `signIn('credentials', …)` from `next-auth/react` in UI code.
     * Kept for legacy call sites during migration.
     */
    async signInWithPassword({ email, password }: { email: string; password: string }) {
      const { signIn } = await import('next-auth/react');
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        return { data: { user: null }, error: { message: result.error } };
      }
      const sessionRes = await dashboardClient.auth.getSession();
      const u = sessionRes.data.session?.user;
      if (u) emit('SIGNED_IN', u);
      return { data: { user: u! }, error: null };
    },

    async signUp({ email, password }: { email: string; password: string; options?: unknown }) {
      try {
        const result = await apiFetch<{ user: { id: string; email: string } }>(`/api/vendor/register`, {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        return { data: { user: result.user }, error: null };
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Sign up failed';
        return { data: { user: null }, error: { message } };
      }
    },

    async signOut() {
      const { signOut } = await import('next-auth/react');
      await signOut({ redirect: false });
      emit('SIGNED_OUT', null);
      return { error: null };
    },

    async resetPasswordForEmail(email: string, _options?: { redirectTo?: string }) {
      await apiFetch(`/api/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ email, newPassword: 'TempPass123!ChangeMe' }),
      });
      return { data: null, error: null };
    },

    async updateUser(payload: { password?: string; data?: Record<string, unknown> }) {
      const password = payload.password;
      if (!password) return { data: null, error: null };
      await apiFetch(`/api/auth/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword: password }),
      });
      emit('USER_UPDATED', null);
      return { data: null, error: null };
    },

    /** @deprecated NextAuth uses cookies; session switching is not supported. */
    async setSession(_session: { access_token?: string | null; refresh_token?: string | null }) {
      return { data: { session: null }, error: null };
    },

    onAuthStateChange(callback: (event: AuthEvent, session: { user: { id: string; email: string } } | null) => void) {
      listeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => listeners.delete(callback),
          },
        },
      };
    },
  },

  from<T = unknown>(table: string) {
    return new QueryBuilder<T>(table);
  },

  async rpc<T = unknown>(fn: string, args?: Record<string, unknown>) {
    const result = await apiFetch<DbResult<unknown[]>>(`/api/db/rpc`, {
      method: 'POST',
      body: JSON.stringify({ fn, args }),
    });
    const rows = result.data as unknown[];
    const data =
      Array.isArray(rows) && rows.length === 1
        ? (rows[0] as T)
        : (rows as unknown as T);
    return { data, error: result.error };
  },

  functions: {
    async invoke<T = unknown>(name: string, options?: { body?: unknown; headers?: Record<string, string> }) {
      return apiFetch<T>(`/api/functions/${encodeURIComponent(name)}`, {
        method: 'POST',
        headers: options?.headers,
        body: JSON.stringify(options?.body ?? {}),
      });
    },
  },

  storage: {
    from(bucket: string) {
      return {
        async upload(path: string, file: File, options?: { upsert?: boolean; cacheControl?: string }) {
          const form = new FormData();
          form.set('bucket', bucket);
          form.set('path', path);
          form.set('upsert', String(options?.upsert ?? false));
          form.set('file', file);
          return apiFetch<{ data: { path: string } | null; error: { message: string } | null }>(
            `/api/storage/upload`,
            {
              method: 'POST',
              body: form,
            },
          );
        },

        async remove(paths: string[]) {
          return apiFetch<{ data: { paths: string[] } | null; error: { message: string } | null }>(
            `/api/storage/remove`,
            {
              method: 'POST',
              body: JSON.stringify({ bucket, paths }),
            },
          );
        },

        getPublicUrl(path: string) {
          return {
            data: {
              publicUrl: `/api/storage/file/${encodeURIComponent(bucket)}/${path
                .split('/')
                .map(encodeURIComponent)
                .join('/')}`,
            },
          };
        },

        async createSignedUrl(path: string, _expiresIn: number) {
          return {
            data: {
              signedUrl: `/api/storage/file/${encodeURIComponent(bucket)}/${path
                .split('/')
                .map(encodeURIComponent)
                .join('/')}`,
            },
            error: null,
          };
        },
      };
    },
  },
};
