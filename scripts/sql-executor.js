/**
 * SUPABASE SQL EXECUTOR
 * 
 * This script executes SQL queries directly on your Supabase database
 * Used by the AI assistant to run database operations
 * 
 * Usage: node sql-executor.js "SELECT * FROM vendors"
 */

const { Client } = require('pg');

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'db.naesxujdffcmatntrlfr.supabase.co',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
};

async function main() {
  const sql = process.argv[2];
  
  if (!sql) {
    console.error('❌ No SQL query provided');
    console.error('Usage: node sql-executor.js "YOUR SQL HERE"');
    process.exit(1);
  }

  if (!DB_CONFIG.password) {
    console.error('❌ Database password not set');
    console.error('Please set DB_PASSWORD environment variable');
    process.exit(1);
  }

  const client = new Client(DB_CONFIG);

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected\n');

    console.log('📝 Executing SQL:');
    console.log('─'.repeat(60));
    console.log(sql.substring(0, 200) + (sql.length > 200 ? '...' : ''));
    console.log('─'.repeat(60) + '\n');

    const result = await client.query(sql);

    if (result.command === 'SELECT' || result.command === 'SHOW') {
      console.log(`✅ Query returned ${result.rows.length} rows:\n`);
      console.log(JSON.stringify(result.rows, null, 2));
    } else {
      console.log(`✅ ${result.command} successful`);
      console.log(`   Rows affected: ${result.rowCount}`);
      if (result.rows.length > 0) {
        console.log('\nResult:');
        console.log(JSON.stringify(result.rows, null, 2));
      }
    }

  } catch (error) {
    console.error('❌ Error executing SQL:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n👋 Connection closed');
  }
}

main();
