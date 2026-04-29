const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

console.log('🔌 Connecting to database...');

// Direct PostgreSQL connection
const pool = new Pool({
  host: 'db.naesxujdffcmatntrlfr.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '-7A7P-!eVp5a9$J',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
  statement_timeout: 60000
});

async function executeMigration() {
  const client = await pool.connect();
  
  try {
    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create-core-tables.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📊 SQL file size:', (sql.length / 1024).toFixed(2), 'KB');
    console.log('🚀 Executing migration...\n');
    
    // Split into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        await client.query(statement);
        successCount++;
        
        // Show progress every 10 statements
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Progress: ${i + 1}/${statements.length} statements executed`);
        }
      } catch (err) {
        // Ignore "already exists" errors
        if (err.code === '42P07' || err.code === '42710' || err.message.includes('already exists')) {
          successCount++;
        } else {
          errorCount++;
          console.error(`❌ Statement ${i + 1} failed:`, err.message.substring(0, 100));
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total: ${statements.length}`);
    
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

executeMigration().catch(console.error);
