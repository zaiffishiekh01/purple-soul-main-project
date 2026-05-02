import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/src/auth';
import { query } from '@/src/lib/server/db';

type FilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'is' | 'in' | 'like' | 'ilike';

interface Filter {
  column: string;
  op: FilterOp;
  value: unknown;
}

interface QueryRequest {
  table: string;
  action: 'select' | 'insert' | 'update' | 'delete' | 'upsert';
  select?: string;
  filters?: Filter[];
  orderBy?: Array<{ column: string; ascending: boolean }>;
  limit?: number;
  offset?: number;
  payload?: Record<string, unknown> | Record<string, unknown>[];
  single?: boolean;
  maybeSingle?: boolean;
}

const IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

function sanitizeIdentifier(input: string): string {
  if (!IDENTIFIER.test(input)) {
    throw new Error(`Invalid identifier: ${input}`);
  }
  return `"${input}"`;
}

function buildWhere(filters: Filter[] | undefined, params: unknown[]) {
  if (!filters?.length) return '';
  const clauses = filters.map((f) => {
    const col = sanitizeIdentifier(f.column);
    switch (f.op) {
      case 'eq':
        params.push(f.value);
        return `${col} = $${params.length}`;
      case 'neq':
        params.push(f.value);
        return `${col} <> $${params.length}`;
      case 'gt':
        params.push(f.value);
        return `${col} > $${params.length}`;
      case 'gte':
        params.push(f.value);
        return `${col} >= $${params.length}`;
      case 'lt':
        params.push(f.value);
        return `${col} < $${params.length}`;
      case 'lte':
        params.push(f.value);
        return `${col} <= $${params.length}`;
      case 'like':
        params.push(f.value);
        return `${col} LIKE $${params.length}`;
      case 'ilike':
        params.push(f.value);
        return `${col} ILIKE $${params.length}`;
      case 'is':
        if (f.value === null) return `${col} IS NULL`;
        if (f.value === 'not.null') return `${col} IS NOT NULL`;
        throw new Error(`Unsupported is() value for ${f.column}`);
      case 'in': {
        if (!Array.isArray(f.value) || f.value.length === 0) {
          return 'FALSE';
        }
        const placeholders = f.value.map((value) => {
          params.push(value);
          return `$${params.length}`;
        });
        return `${col} IN (${placeholders.join(', ')})`;
      }
      default:
        throw new Error(`Unsupported filter op: ${f.op}`);
    }
  });
  return ` WHERE ${clauses.join(' AND ')}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as QueryRequest;
    const table = sanitizeIdentifier(body.table);
    const params: unknown[] = [];
    const where = buildWhere(body.filters, params);

    let sql = '';
    if (body.action === 'select') {
      const selectList = body.select && body.select !== '*' ? body.select : '*';
      sql = `SELECT ${selectList} FROM ${table}${where}`;
      if (body.orderBy?.length) {
        const order = body.orderBy
          .map((item) => `${sanitizeIdentifier(item.column)} ${item.ascending ? 'ASC' : 'DESC'}`)
          .join(', ');
        sql += ` ORDER BY ${order}`;
      }
      if (typeof body.limit === 'number') {
        params.push(body.limit);
        sql += ` LIMIT $${params.length}`;
      }
      if (typeof body.offset === 'number') {
        params.push(body.offset);
        sql += ` OFFSET $${params.length}`;
      }
    } else if (body.action === 'insert' || body.action === 'upsert') {
      const rows = Array.isArray(body.payload) ? body.payload : [body.payload ?? {}];
      if (!rows.length || !Object.keys(rows[0]).length) throw new Error('Insert payload is required');
      const columns = Object.keys(rows[0]);
      const columnSql = columns.map(sanitizeIdentifier).join(', ');
      const valuesSql = rows
        .map((row) => {
          const placeholders = columns.map((col) => {
            params.push((row as Record<string, unknown>)[col]);
            return `$${params.length}`;
          });
          return `(${placeholders.join(', ')})`;
        })
        .join(', ');
      sql = `INSERT INTO ${table} (${columnSql}) VALUES ${valuesSql}`;
      if (body.action === 'upsert') {
        sql += ' ON CONFLICT DO NOTHING';
      }
      sql += ' RETURNING *';
    } else if (body.action === 'update') {
      const payload = (body.payload ?? {}) as Record<string, unknown>;
      const entries = Object.entries(payload);
      if (!entries.length) throw new Error('Update payload is required');
      const set = entries
        .map(([key, value]) => {
          params.push(value);
          return `${sanitizeIdentifier(key)} = $${params.length}`;
        })
        .join(', ');
      sql = `UPDATE ${table} SET ${set}${where} RETURNING *`;
    } else if (body.action === 'delete') {
      sql = `DELETE FROM ${table}${where} RETURNING *`;
    } else {
      throw new Error(`Unsupported action: ${String(body.action)}`);
    }

    const result = await query(sql, params);
    const rows = result.rows;
    if (body.single) {
      return NextResponse.json({ data: rows[0] ?? null, error: null });
    }
    if (body.maybeSingle) {
      return NextResponse.json({ data: rows[0] ?? null, error: null });
    }
    return NextResponse.json({ data: rows, error: null });
  } catch (error) {
    return NextResponse.json(
      { data: null, error: error instanceof Error ? error.message : 'Query failed' },
      { status: 500 },
    );
  }
}

