const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

const sqlFilePath = path.join(__dirname, 'create-feature-tables.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Creating remaining 5 feature tables...\n');

// Split into individual statements
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))
  .map(s => s + ';');

console.log(`📝 Found ${statements.length} SQL statements\n`);

async function executeStatement(sql, index) {
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
            resolve({ status: 'success' });
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
    try {
      const result = await executeStatement(statements[i], i);
      if (result.status === 'success') {
        successCount++;
      } else if (result.status === 'skipped') {
        skipCount++;
      }
    } catch (err) {
      errorCount++;
      if (errorCount <= 3) {
        console.log(`  ❌ ${err.message.substring(0, 100)}`);
      }
    }
    
    if ((i + 1) % 5 === 0) {
      console.log(`⏳ Progress: ${i + 1}/${statements.length}...`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ FEATURE TABLES COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

runMigration().catch(console.error);
