/**
 * Applies timestamp-ordered `.sql` files from `dashboard/postgres/migrations/` to the database
 * named in `DATABASE_URL`, recording each filename (without extension) in `public.schema_migrations`.
 *
 * SQL is executed exactly as on disk. If a migration references objects your Postgres does not
 * have (e.g. a vendor-specific publication), fix or replace that migration file — this runner
 * does not rewrite migration bodies.
 */
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('Missing DATABASE_URL in environment.');
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
});

const MIGRATIONS_DIR = path.join(__dirname, '..', 'postgres', 'migrations');

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

async function main() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(
      `Migrations directory not found: ${MIGRATIONS_DIR}\n` +
        'Expected dashboard/postgres/migrations (SQL files). Create it or fix the path.',
    );
  }

  const client = await pool.connect();
  try {
    await ensureMigrationsTable(client);

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((name) => name.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      const exists = await client.query('SELECT 1 FROM public.schema_migrations WHERE version = $1', [version]);
      if (exists.rowCount) {
        console.log(`⏭️  Skipping already applied: ${file}`);
        continue;
      }

      const fullPath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(fullPath, 'utf8');
      console.log(`🚀 Applying ${file}`);
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO public.schema_migrations(version) VALUES ($1)', [version]);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Migration failed (${file}): ${error.message}`);
      }
    }

    console.log('🎉 Dashboard migrations applied successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

