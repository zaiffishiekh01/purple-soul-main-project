const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'create-core-tables.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Executing migration: create-core-tables.sql\n');

// Split into individual statements properly
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .map(s => s + ';'); // Add semicolon back

console.log(`📝 Found ${statements.length} SQL statements\n`);

async function executeStatement(sql, index, total) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });
    
    const options = {
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            const errorMsg = result.message || '';
            if (errorMsg.includes('already exists') || errorMsg.includes('42P07') || errorMsg.includes('42710')) {
              resolve({ status: 'skipped' });
            } else {
              reject(new Error(errorMsg));
            }
          } else {
            resolve({ status: 'success', data: result });
          }
        } catch (e) {
          resolve({ status: 'unknown' });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runMigration() {
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    
    // Show progress
    if ((i + 1) % 5 === 0 || i === 0) {
      console.log(`⏳ Progress: ${i + 1}/${statements.length}...`);
    }
    
    try {
      const result = await executeStatement(stmt, i, statements.length);
      if (result.status === 'success') successCount++;
      else if (result.status === 'skipped') skipCount++;
    } catch (err) {
      errorCount++;
      // Log first few errors for debugging
      if (errorCount <= 3) {
        console.log(`  ❌ ${err.message.substring(0, 100)}`);
      }
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Skipped (already exists): ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total Statements: ${statements.length}`);
}

runMigration().catch(console.error);
