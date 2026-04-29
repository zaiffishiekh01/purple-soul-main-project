const https = require('https');

const sql = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE products SET is_active = true WHERE status = 'active' OR status IS NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS title TEXT;
UPDATE products SET title = name WHERE title IS NULL AND name IS NOT NULL;
`;

console.log('Adding is_active and title columns to products...');

https.request({
  hostname: 'api.supabase.com',
  path: '/v1/projects/naesxujdffcmatntrlfr/database/query',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e',
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data.substring(0, 200));
  });
}).end(JSON.stringify({ query: sql }));
