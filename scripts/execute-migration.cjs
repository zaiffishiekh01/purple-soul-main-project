const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

// Read the SQL file
const sqlFilePath = path.join(__dirname, 'create-core-tables.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Executing migration: create-core-tables.sql');
console.log('📊 SQL size:', (sql.length / 1024).toFixed(2), 'KB');
console.log('\n⏳ Please wait, this may take a moment...\n');

// Split into batches of ~2KB each to avoid timeout
const batchSize = 2000;
const batches = [];
for (let i = 0; i < sql.length; i += batchSize) {
  // Find the nearest semicolon
  let end = sql.indexOf(';', i + batchSize - 100);
  if (end === -1 || end > i + batchSize + 500) {
    end = i + batchSize;
  } else {
    end += 1; // Include the semicolon
  }
  batches.push(sql.substring(i, Math.min(end, sql.length)));
}

async function executeBatch(batch, index, total) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: batch });
    
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
            // Check if it's an "already exists" error - if so, continue
            const errorMsg = result.message || '';
            if (errorMsg.includes('already exists') || errorMsg.includes('42P07') || errorMsg.includes('42710')) {
              console.log(`⚠️  Batch ${index + 1}/${total}: Skipped (already exists)`);
              resolve({ status: 'skipped' });
            } else {
              console.error(`❌ Batch ${index + 1}/${total} failed:`, errorMsg.substring(0, 150));
              reject(new Error(errorMsg));
            }
          } else {
            console.log(`✅ Batch ${index + 1}/${total}: Success`);
            resolve({ status: 'success', data: result });
          }
        } catch (e) {
          resolve({ status: 'unknown', data: data.substring(0, 200) });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function runMigration() {
  console.log(`📦 Split into ${batches.length} batches\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < batches.length; i++) {
    try {
      const result = await executeBatch(batches[i], i, batches.length);
      if (result.status === 'success') successCount++;
      else if (result.status === 'skipped') skipCount++;
    } catch (err) {
      errorCount++;
      // Continue on error
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 MIGRATION COMPLETE');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`⚠️  Skipped: ${skipCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📊 Total Batches: ${batches.length}`);
}

runMigration().catch(console.error);
