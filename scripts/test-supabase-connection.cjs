const { createClient } = require('@supabase/supabase-js');
const https = require('https');

// Supabase configuration with your project
const SUPABASE_URL = 'https://naesxujdffcmatntrlfr.supabase.co';
const ACCESS_TOKEN = 'sbp_06b4c955e037b7586a1515e1e8fa7abecda1578e';

// Create Supabase client with service token
const supabase = createClient(SUPABASE_URL, ACCESS_TOKEN, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Helper function to make authenticated REST API calls
async function apiCall(method, path, body = null) {
  const url = new URL(path, SUPABASE_URL);
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'apikey': ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  console.log('Project URL:', SUPABASE_URL);
  console.log('Token:', ACCESS_TOKEN.substring(0, 20) + '...\n');

  try {
    // Test 1: Try REST API
    console.log('Test 1: REST API (products table)');
    const products = await apiCall('GET', '/rest/v1/products?limit=1');
    if (Array.isArray(products) || products.code) {
      if (products.code) {
        console.log('  Response:', products.message || products.code);
      } else {
        console.log('  ✅ Products table accessible');
      }
    }

    // Test 2: Try auth endpoint
    console.log('\nTest 2: Auth system');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError && authError.message.includes('Invalid')) {
      console.log('  ⚠️  Token format may not be compatible');
    } else {
      console.log('  ✅ Auth system accessible');
    }

    // Test 3: Try to list tables via REST
    console.log('\nTest 3: Database schema access');
    const tables = await apiCall('GET', '/rest/v1/?apikey=' + ACCESS_TOKEN);
    if (tables) {
      console.log('  ✅ REST API endpoint responding');
    }

    console.log('\n' + '='.repeat(50));
    console.log('Note: The token format (sbp_) appears to be a platform token.');
    console.log('For full database management, you may need:');
    console.log('  - Anon key (eyJ...) from Settings > API');
    console.log('  - Service role key (eyJ...) from Settings > API');
    console.log('='.repeat(50));

  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

module.exports = { supabase, apiCall };

if (require.main === module) {
  testConnection();
}
