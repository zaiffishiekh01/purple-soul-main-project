const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

const sqlFilePath = path.join(__dirname, 'auto-create-user-on-signup.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Running auto-create-user-on-signup.sql...\n');

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
        if (res.statusCode >= 400) {
          try {
            const result = JSON.parse(data);
            if (result.message && result.message.includes('already exists')) {
              resolve({ status: 'skipped', message: result.message });
            } else {
              console.error(`❌ Statement ${index + 1} failed:`, result.message?.substring(0, 150));
              reject(new Error(result.message));
            }
          } catch (e) {
            console.error(`❌ Statement ${index + 1} failed:`, data.substring(0, 150));
            reject(new Error(data));
          }
        } else {
          resolve({ status: 'success', data });
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
        console.log(`✅ Statement ${i + 1}/${statements.length}: Success`);
      } else if (result.status === 'skipped') {
        skipCount++;
        console.log(`⚠️  Statement ${i + 1}/${statements.length}: Already exists`);
      }
    } catch (err) {
      // Ignore duplicate key errors - they mean it already worked
      if (err.message && err.message.includes('duplicate')) {
        skipCount++;
        console.log(`⚠️  Statement ${i + 1}/${statements.length}: Already exists`);
      } else {
        errorCount++;
        console.log(`❌ Statement ${i + 1}/${statements.length}: ${err.message?.substring(0, 100)}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Skipped (already exists): ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

runMigration().catch(console.error);
