const https = require('https');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

// Check vendor_status enum
const sql1 = `SELECT enumlabel FROM pg_enum WHERE enumtypid=(SELECT oid FROM pg_type WHERE typname='vendor_status') ORDER BY enumsortorder;`;

// Check user_role enum
const sql2 = `SELECT enumlabel FROM pg_enum WHERE enumtypid=(SELECT oid FROM pg_type WHERE typname='user_role') ORDER BY enumsortorder;`;

async function runQuery(sql, label) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_ID}/database/query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        console.log(`\n📊 ${label}:`);
        console.log(d);
        resolve(JSON.parse(d));
      });
    });
    req.on('error', reject);
    req.end(JSON.stringify({ query: sql }));
  });
}

(async () => {
  try {
    await runQuery(sql1, 'vendor_status enum');
    await runQuery(sql2, 'user_role enum');
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
