const https = require('https');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

const sqlFilePath = path.join(__dirname, 'auto-create-user-on-signup.sql');
const sql = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🚀 Running auto-create-user-on-signup.sql as single batch...\n');
console.log('📊 SQL size:', (sql.length / 1024).toFixed(2), 'KB\n');

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

console.log('⏳ Executing...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode >= 400) {
      try {
        const result = JSON.parse(data);
        console.error('❌ Failed:', result.message || data.substring(0, 500));
      } catch (e) {
        console.error('❌ Failed:', data.substring(0, 500));
      }
    } else {
      try {
        const result = JSON.parse(data);
        console.log('✅ SUCCESS!');
        console.log('\n📊 Results:', JSON.stringify(result, null, 2));
      } catch (e) {
        console.log('✅ SUCCESS!');
        console.log('\n📊 Response:', data.substring(0, 1000));
      }
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request error:', err.message);
});

req.write(postData);
req.end();
