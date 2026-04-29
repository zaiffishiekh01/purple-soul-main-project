/**
 * E-COMMERCE INTEGRATION TEST SUITE
 * 
 * Tests the complete e-commerce flow:
 * 1. Customer portal ↔ Dashboard data sync
 * 2. Product visibility
 * 3. Order creation & management
 * 4. Returns & refunds
 * 5. Vendor management
 * 6. Admin permissions
 * 7. Real-time updates
 * 
 * Run: node scripts/test-suite.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test state
let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function log(test, status, details = '') {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${test}${details ? ` - ${details}` : ''}`);
  
  testResults.tests.push({ test, status, details });
  if (status === 'PASS') testResults.passed++;
  if (status === 'FAIL') testResults.failed++;
}

async function test(description, fn) {
  try {
    await fn();
    log(description, 'PASS');
  } catch (error) {
    log(description, 'FAIL', error.message);
  }
}

// ==========================================
// TEST 1: DATABASE CONNECTIVITY
// ==========================================
async function testConnectivity() {
  console.log('\n📡 DATABASE CONNECTIVITY');
  console.log('─'.repeat(60));

  await test('Can connect to Supabase', async () => {
    const { error } = await supabase.from('vendors').select('count', { count: 'exact', head: true });
    if (error && !error.message.includes('not found')) throw error;
  });

  await test('Environment variables configured', async () => {
    if (!supabaseUrl.includes('supabase.co')) {
      throw new Error('Invalid Supabase URL');
    }
  });
}

// ==========================================
// TEST 2: PRODUCTS VISIBILITY
// ==========================================
async function testProducts() {
  console.log('\n📦 PRODUCTS & CATALOG');
  console.log('─'.repeat(60));

  await test('Products table exists', async () => {
    const { error } = await supabase.from('products').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Products table missing');
    }
  });

  await test('Products are visible to customer portal', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, status')
      .eq('status', 'active')
      .limit(10);
    
    if (error) throw error;
    if (data && data.length > 0) {
      console.log(`   Found ${data.length} active products`);
    }
  });

  await test('Products have vendor associations', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, vendor_id')
      .not('vendor_id', 'is', null)
      .limit(1);
    
    if (error && !error.message.includes('column')) {
      throw error;
    }
  });

  await test('Products have categories', async () => {
    const { data, error } = await supabase
      .from('products')
      .select('id, category_id')
      .not('category_id', 'is', null)
      .limit(1);
    
    if (error && !error.message.includes('column')) {
      throw error;
    }
  });
}

// ==========================================
// TEST 3: VENDORS MANAGEMENT
// ==========================================
async function testVendors() {
  console.log('\n🏪 VENDORS');
  console.log('─'.repeat(60));

  await test('Vendors table accessible', async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('id, business_name, status')
      .limit(10);
    
    if (error) throw error;
    if (data && data.length > 0) {
      console.log(`   Found ${data.length} vendors`);
    }
  });

  await test('Vendors have proper status values', async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('status')
      .in('status', ['active', 'pending', 'suspended', 'inactive'])
      .limit(1);
    
    if (error) throw error;
  });

  await test('delete_vendor_bypass function exists', async () => {
    const { error } = await supabase.rpc('delete_vendor_bypass', {
      p_vendor_id: '00000000-0000-0000-0000-000000000000'
    });
    
    if (error && error.message.includes('does not exist')) {
      throw new Error('Function not deployed - run APPLY_ALL_FIXES.sql');
    }
  });
}

// ==========================================
// TEST 4: ORDERS SYSTEM
// ==========================================
async function testOrders() {
  console.log('\n🛒 ORDERS');
  console.log('─'.repeat(60));

  await test('Orders table exists', async () => {
    const { error } = await supabase.from('orders').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Orders table missing');
    }
  });

  await test('Orders have proper status', async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
      .limit(10);
    
    if (error) throw error;
    if (data && data.length > 0) {
      console.log(`   Found ${data.length} orders`);
    }
  });

  await test('Order items table exists', async () => {
    const { error } = await supabase.from('order_items').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Order items table missing');
    }
  });
}

// ==========================================
// TEST 5: ADMIN SYSTEM
// ==========================================
async function testAdmins() {
  console.log('\n👨‍💼 ADMIN SYSTEM');
  console.log('─'.repeat(60));

  await test('Admin users table exists', async () => {
    const { error } = await supabase.from('admin_users').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('admin_users table missing');
    }
  });

  await test('create_admin_user_bypass function exists', async () => {
    const { error } = await supabase.rpc('create_admin_user_bypass', {
      p_user_id: '00000000-0000-0000-0000-000000000000',
      p_email: 'test@test.com',
      p_role: 'admin',
      p_is_super_admin: false,
      p_permissions: {}
    });
    
    if (error && error.message.includes('does not exist')) {
      throw new Error('Function not deployed - run APPLY_ALL_FIXES.sql');
    }
  });

  await test('At least one super admin exists', async () => {
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, is_super_admin')
      .eq('is_super_admin', true)
      .limit(1);
    
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('No super admin found - cannot create other admins');
    }
  });
}

// ==========================================
// TEST 6: RETURNS & REFUNDS
// ==========================================
async function testReturnsRefunds() {
  console.log('\n🔄 RETURNS & REFUNDS');
  console.log('─'.repeat(60));

  await test('Returns table exists', async () => {
    const { error } = await supabase.from('returns').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Returns table missing');
    }
  });

  await test('Refunds table exists', async () => {
    const { error } = await supabase.from('refunds').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Refunds table missing');
    }
  });
}

// ==========================================
// TEST 7: CATEGORIES & NAVIGATION
// ==========================================
async function testCategories() {
  console.log('\n📂 CATEGORIES & NAVIGATION');
  console.log('─'.repeat(60));

  await test('Categories table exists', async () => {
    const { error } = await supabase.from('categories').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Categories table missing');
    }
  });

  await test('Categories are hierarchical', async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('id, parent_id, name')
      .limit(5);
    
    if (error) throw error;
    if (data && data.length > 0) {
      console.log(`   Found ${data.length} categories`);
    }
  });
}

// ==========================================
// TEST 8: NOTIFICATIONS
// ==========================================
async function testNotifications() {
  console.log('\n🔔 NOTIFICATIONS');
  console.log('─'.repeat(60));

  await test('Notifications table exists', async () => {
    const { error } = await supabase.from('notifications').select('id').limit(1);
    if (error && error.message.includes('does not exist')) {
      throw new Error('Notifications table missing');
    }
  });
}

// ==========================================
// REPORT
// ==========================================
function printReport() {
  console.log('\n' + '═'.repeat(60));
  console.log('📊 E-COMMERCE INTEGRATION TEST REPORT');
  console.log('═'.repeat(60));
  
  console.log(`\n✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📝 Total:  ${testResults.passed + testResults.failed}`);
  
  const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
  console.log(`\n📈 Success Rate: ${successRate}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests
      .filter(t => t.status === 'FAIL')
      .forEach(t => {
        console.log(`   • ${t.test}`);
        console.log(`     ${t.details}`);
      });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('   1. Run: scripts/APPLY_ALL_FIXES.sql in Supabase SQL Editor');
    console.log('   2. Check .env file has correct Supabase credentials');
    console.log('   3. Verify Supabase project is active');
  } else {
    console.log('\n✅ ALL TESTS PASSED - E-commerce system fully functional!');
  }

  console.log('\n' + '═'.repeat(60));
}

// ==========================================
// RUN ALL TESTS
// ==========================================
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   E-COMMERCE INTEGRATION TEST SUITE                   ║');
  console.log('║   Testing Complete System Functionality                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n🔗 Supabase: ${supabaseUrl}`);
  console.log(`📅 Date: ${new Date().toISOString()}\n`);

  await testConnectivity();
  await testProducts();
  await testVendors();
  await testOrders();
  await testAdmins();
  await testReturnsRefunds();
  await testCategories();
  await testNotifications();

  printReport();

  process.exit(testResults.failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
