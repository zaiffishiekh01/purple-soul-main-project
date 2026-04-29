const https = require('https');

const SUPABASE_URL = 'https://naesxujdffcmatntrlfr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXN4dWpkZmZjbWF0bnRybGZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3MjA4MiwiZXhwIjoyMDkxMjQ4MDgyfQ.Yi8rHH7HZ9vIaIpE4ud-U264naXEf_Dn0MDHOtCkO-M';

async function query(sql) {
  const body = JSON.stringify({ query: sql });
  return new Promise((resolve, reject) => {
    const url = new URL('https://api.supabase.com/v1/projects/naesxujdffcmatntrlfr/sql');
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(result.message || JSON.stringify(result)));
          } else {
            resolve(result);
          }
        } catch (e) {
          reject(new Error(data));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function comprehensiveAnalysis() {
  console.log('🔬 COMPREHENSIVE DATABASE ANALYSIS\n');
  console.log('='.repeat(70));

  // 1. List all tables
  console.log('\n📋 1. ALL DATABASE TABLES\n');
  const tables = await query(`
    SELECT table_name, table_schema 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log(`Found ${tables.length} tables:`);
  tables.forEach(t => console.log(`  ✓ ${t.table_name}`));

  // 2. Check migration tracking
  console.log('\n📝 2. MIGRATION TRACKING\n');
  try {
    const migrations = await query(`SELECT * FROM _migrations ORDER BY applied_at DESC;`);
    console.log(`Tracked migrations: ${migrations.length}`);
    migrations.forEach(m => console.log(`  ✓ ${m.name} (${m.applied_at})`));
  } catch (e) {
    console.log('⚠️  _migrations table does not exist');
  }

  // 3. Check schema_migrations (Supabase standard)
  console.log('\n📝 3. SCHEMA MIGRATIONS (Supabase standard)\n');
  try {
    const schemaMigrations = await query(`SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC;`);
    console.log(`Supabase tracked migrations: ${schemaMigrations.length}`);
    schemaMigrations.forEach(m => console.log(`  ✓ Version: ${m.version}`));
  } catch (e) {
    console.log('⚠️  supabase_migrations.schema_migrations does not exist');
  }

  // 4. Products table structure
  console.log('\n📦 4. PRODUCTS TABLE STRUCTURE\n');
  try {
    const productColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'products' 
      ORDER BY ordinal_position;
    `);
    console.log(`Products table columns: ${productColumns.length}`);
    productColumns.forEach(c => console.log(`  ${c.column_name} (${c.data_type}, ${c.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`));
  } catch (e) {
    console.log('❌ Products table issue:', e.message);
  }

  // 5. Orders table structure
  console.log('\n🛒 5. ORDERS TABLE STRUCTURE\n');
  try {
    const orderColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'orders' 
      ORDER BY ordinal_position;
    `);
    console.log(`Orders table columns: ${orderColumns.length}`);
    orderColumns.forEach(c => console.log(`  ${c.column_name} (${c.data_type}, ${c.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`));
  } catch (e) {
    console.log('❌ Orders table issue:', e.message);
  }

  // 6. Vendors table structure
  console.log('\n🏪 6. VENDORS TABLE STRUCTURE\n');
  try {
    const vendorColumns = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'vendors' 
      ORDER BY ordinal_position;
    `);
    console.log(`Vendors table columns: ${vendorColumns.length}`);
    vendorColumns.forEach(c => console.log(`  ${c.column_name} (${c.data_type}, ${c.is_nullable === 'YES' ? 'nullable' : 'NOT NULL'})`));
  } catch (e) {
    console.log('❌ Vendors table issue:', e.message);
  }

  // 7. Check enums
  console.log('\n🎨 7. ENUM TYPES\n');
  try {
    const enums = await query(`
      SELECT enumtypid::regtype AS enum_type, enumlabel 
      FROM pg_enum 
      ORDER BY enum_type, enumsortorder;
    `);
    console.log(`Found ${enums.length} enum values:`);
    enums.forEach(e => console.log(`  ${e.enum_type}: ${e.enumlabel}`));
  } catch (e) {
    console.log('⚠️  Could not retrieve enums:', e.message);
  }

  // 8. Check RLS status
  console.log('\n🔒 8. ROW LEVEL SECURITY STATUS\n');
  const rlsTables = await query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND rowsecurity = true
    ORDER BY tablename;
  `);
  console.log(`Tables with RLS enabled: ${rlsTables.length}`);
  rlsTables.forEach(t => console.log(`  ✓ ${t.tablename}`));

  // 9. Check functions
  console.log('\n⚙️  9. CUSTOM FUNCTIONS\n');
  try {
    const functions = await query(`
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name NOT LIKE 'pg_%'
      ORDER BY routine_name;
    `);
    console.log(`Custom functions: ${functions.length}`);
    functions.slice(0, 20).forEach(f => console.log(`  ${f.routine_name} (${f.routine_type})`));
    if (functions.length > 20) {
      console.log(`  ... and ${functions.length - 20} more`);
    }
  } catch (e) {
    console.log('⚠️  Could not retrieve functions');
  }

  // 10. Row counts
  console.log('\n📊 10. TABLE ROW COUNTS\n');
  for (const table of tables) {
    try {
      const count = await query(`SELECT COUNT(*) FROM ${table.table_name};`);
      console.log(`  ${table.table_name}: ${count[0].count} rows`);
    } catch (e) {
      console.log(`  ${table.table_name}: Error accessing`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ ANALYSIS COMPLETE');
  console.log('='.repeat(70));
}

comprehensiveAnalysis().catch(console.error);
