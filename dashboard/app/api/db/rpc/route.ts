import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { query } from '@/src/lib/server/db';

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function sanitizeIdentifier(input: string): string {
  if (!IDENTIFIER.test(input)) {
    throw new Error(`Invalid identifier: ${input}`);
  }
  return `"${input}"`;
}

/**
 * `SELECT * FROM fn(...)` for a scalar-returning Postgres function yields one column
 * named after the function, e.g. `{ get_admin_permissions: { ...jsonb } }`.
 * Callers expect the inner value (same shape as `SELECT fn(...)`).
 */
function unwrapRpcRow(row: unknown): unknown {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return row;
  }
  const o = row as Record<string, unknown>;
  const keys = Object.keys(o);
  if (keys.length !== 1) {
    return row;
  }
  const v = o[keys[0]!];
  if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
    return v;
  }
  return row;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const { fn, args } = (await request.json()) as { fn?: string; args?: Record<string, unknown> };
    if (!fn) {
      return NextResponse.json({ data: null, error: 'Missing RPC function name' }, { status: 400 });
    }

    const values = Object.values(args ?? {});
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const sql = `SELECT * FROM ${sanitizeIdentifier(fn)}(${placeholders})`;
    const result = await query(sql, values);
    const rows = (result.rows as unknown[]).map(unwrapRpcRow);
    return NextResponse.json({ data: rows, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: error instanceof Error ? error.message : 'RPC failed' },
      { status: 500 },
    );
  }
}

