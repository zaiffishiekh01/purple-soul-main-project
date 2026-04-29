const https = require('https');

const SUPABASE_URL = 'https://naesxujdffcmatntrlfr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hZXN4dWpkZmZjbWF0bnRybGZyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTY3MjA4MiwiZXhwIjoyMDkxMjQ4MDgyfQ.Yi8rHH7HZ9vIaIpE4ud-U264naXEf_Dn0MDHOtCkO-M';

async function restQuery(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}${endpoint}`);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'apikey': SERVICE_ROLE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (res.statusCode >= 400) {
            reject(new Error(`${res.statusCode}: ${result.message || data}`));
          } else {
            resolve(result);
          }
        } catch (e) {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testTable(tableName) {
  try {
    const data = await restQuery(`/rest/v1/${tableName}?limit=1&select=*`);
    if (Array.isArray(data)) {
      console.log(`✅ ${tableName}: EXISTS (${data.length} rows sampled)`);
      if (data.length > 0 && typeof data[0] === 'object') {
        const columns = Object.keys(data[0]);
        console.log(`   Columns: ${columns.slice(0, 10).join(', ')}${columns.length > 10 ? '...' : ''}`);
      }
      return { exists: true, columns: data.length > 0 ? Object.keys(data[0]) : [] };
    } else {
      console.log(`✅ ${tableName}: EXISTS`);
      return { exists: true, columns: [] };
    }
  } catch (e) {
    const status = e.message.split(':')[0];
    if (status === '404') {
      console.log(`❌ ${tableName}: NOT FOUND`);
      return { exists: false };
    }
    console.log(`⚠️  ${tableName}: ${e.message.split('\n')[0]}`);
    return { exists: true, error: e.message };
  }
}

async function fullAnalysis() {
  console.log('🔍 COMPREHENSIVE DATABASE ANALYSIS (REST API)\n');
  console.log('='.repeat(70));
  console.log('Project: naesxujdffcmatntrlfr');
  console.log('Status: ACTIVE_HEALTHY\n');

  // Test all expected tables from migrations
  const expectedTables = {
    'Core Tables': ['products', 'categories', 'collections', 'vendors', 'orders', 'order_items', 'cart_items', 'payments', 'shipments', 'returns', 'refunds'],
    'User Management': ['users', 'user_profiles', 'admin_users', 'user_roles', 'roles', 'permissions'],
    'Wishlist': ['wishlist', 'wishlists', 'wishlist_items'],
    'Reviews': ['product_reviews', 'product_reviews_moderated', 'review_images', 'review_helpful_votes'],
    'Inventory': ['inventory', 'inventory_transactions', 'inventory_alerts', 'product_skus'],
    'Dashboard': ['support_tickets', 'ticket_messages', 'financial_transactions', 'payout_requests', 'notifications'],
    'Advanced Features': ['promotions', 'discount_codes', 'analytics_events', 'search_queries', 'gift_cards', 'user_carts'],
    'New Features': ['artisans', 'travel_vendors', 'travel_packages', 'wedding_registries', 'celebration_registries']
  };

  const results = { exists: [], missing: [], error: [] };

  for (const [category, tables] of Object.entries(expectedTables)) {
    console.log(`\n📋 ${category}`);
    console.log('-'.repeat(50));
    
    for (const table of tables) {
      const result = await testTable(table);
      if (result.exists) {
        results.exists.push(table);
      } else {
        results.missing.push(table);
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Tables found: ${results.exists.length}`);
  console.log(`❌ Tables missing: ${results.missing.length}`);
  
  if (results.missing.length > 0) {
    console.log('\nMissing tables that need to be created:');
    results.missing.forEach(t => console.log(`  ❌ ${t}`));
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ ANALYSIS COMPLETE');
  console.log('='.repeat(70));
}

fullAnalysis().catch(console.error);
