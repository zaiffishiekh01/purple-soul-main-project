const { Pool } = require('pg');

const targetUrl = process.env.DATABASE_URL;
const sourceUrl = process.env.SOURCE_DATABASE_URL;

if (!targetUrl) throw new Error('Missing DATABASE_URL in environment.');
if (!sourceUrl) throw new Error('Missing SOURCE_DATABASE_URL in environment.');

const sourcePool = new Pool({
  connectionString: sourceUrl,
  ssl: process.env.SOURCE_PGSSL === 'false' ? false : { rejectUnauthorized: false },
});
const targetPool = new Pool({
  connectionString: targetUrl,
  ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
});

async function listPublicTables(client) {
  const { rows } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      AND table_name NOT IN ('schema_migrations')
    ORDER BY table_name ASC
  `);
  return rows.map((row) => row.table_name);
}

async function copyTable(table) {
  const source = await sourcePool.query(`SELECT * FROM "${table}"`);
  if (!source.rows.length) {
    console.log(`⏭️  ${table}: no rows`);
    return;
  }

  const columns = Object.keys(source.rows[0]);
  const columnList = columns.map((col) => `"${col}"`).join(', ');

  const values = [];
  const chunks = [];
  source.rows.forEach((row, rowIndex) => {
    const placeholders = columns.map((col, colIndex) => {
      values.push(row[col]);
      return `$${rowIndex * columns.length + colIndex + 1}`;
    });
    chunks.push(`(${placeholders.join(', ')})`);
  });

  const sql = `INSERT INTO "${table}" (${columnList}) VALUES ${chunks.join(', ')}`;
  await targetPool.query(sql, values);
  console.log(`✅ ${table}: copied ${source.rows.length} rows`);
}

async function main() {
  const target = await targetPool.connect();
  try {
    const tables = await listPublicTables(target);
    await target.query('BEGIN');
    for (const table of tables) {
      await target.query(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE`);
      await copyTable(table);
    }
    await target.query('COMMIT');
    console.log('🎉 Production data copied successfully.');
  } catch (error) {
    await target.query('ROLLBACK');
    throw error;
  } finally {
    target.release();
    await sourcePool.end();
    await targetPool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

