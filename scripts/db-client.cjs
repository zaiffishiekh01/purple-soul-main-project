const { createClient } = require('@supabase/supabase-js');
const { Pool } = require('pg');

// Configuration
const config = {
  supabaseUrl: 'https://naesxujdffcmatntrlfr.supabase.co',
  supabaseKey: 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e',
  dbHost: 'db.naesxujdffcmatntrlfr.supabase.co',
  dbPort: 5432,
  dbName: 'postgres',
  dbUser: 'postgres',
  dbPassword: '-7A7P-!eVp5a9$J'
};

// Create Supabase client (for API operations)
const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Create PostgreSQL pool (for direct SQL)
const pool = new Pool({
  host: config.dbHost,
  port: config.dbPort,
  database: config.dbName,
  user: config.dbUser,
  password: config.dbPassword,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase API connection...');
    const { data, error } = await supabase.from('products').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase API Error:', error.message);
    } else {
      console.log('✅ Supabase API connection successful!');
    }

    console.log('\n🔍 Testing direct PostgreSQL connection...');
    const client = await pool.connect();
    const result = await client.query('SELECT version();');
    console.log('✅ PostgreSQL connection successful!');
    console.log('📊 PostgreSQL version:', result.rows[0].version.substring(0, 80));
    client.release();

    console.log('\n✅ All connections working! Ready to manage your database.');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

module.exports = { supabase, pool, config };

if (require.main === module) {
  testConnection();
}
