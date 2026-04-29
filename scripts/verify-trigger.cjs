const https = require('https');

const PROJECT_ID = 'naesxujdffcmatntrlfr';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

const sql = `
-- Check trigger exists
SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
-- Count users
SELECT COUNT(*) as user_count FROM public.users;
-- Count customers
SELECT COUNT(*) as customer_count FROM public.customers;
-- Show auth users
SELECT id, email, raw_user_meta_data->>'full_name' as full_name, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;
-- Show public users
SELECT id, email, full_name, role, status, created_at FROM public.users ORDER BY created_at DESC LIMIT 10;
-- Show customers
SELECT id, email, first_name, last_name, status, created_at FROM public.customers ORDER BY created_at DESC LIMIT 10;
`;

console.log('🔍 Verifying trigger and data...\n');

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
    try {
      const result = JSON.parse(d);
      console.log('✅ Verification Results:\n');
      
      if (Array.isArray(result)) {
        result.forEach((r, i) => {
          if (r && r.command) {
            console.log(`  ${i + 1}. ${r.command}: ${JSON.stringify(r.rows || r)}`);
          } else if (Array.isArray(r)) {
            console.log(`  ${i + 1}. ${JSON.stringify(r)}`);
          }
        });
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.log('Response:', d.substring(0, 1000));
    }
  });
});

req.on('error', console.error);
req.end(JSON.stringify({ query: sql }));
